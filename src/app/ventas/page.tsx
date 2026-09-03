'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ventasAPI, productosAPI, type Venta, type Producto } from '@/lib/supabase'
import { exportToPDF, exportToExcel } from '@/lib/export'

export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [ventasFiltradas, setVentasFiltradas] = useState<any[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: 1,
    cliente: ''
  })
  
  // Filtros
  const [filtroProducto, setFiltroProducto] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [busqueda, setBusqueda] = useState('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    aplicarFiltros()
  }, [ventas, filtroProducto, filtroCliente, filtroFechaInicio, filtroFechaFin, busqueda])
  
  const loadData = async () => {
    try {
      const [ventasData, productosData] = await Promise.all([
        ventasAPI.getAll(),
        productosAPI.getAll()
      ])
      setVentas(ventasData)
      setVentasFiltradas(ventasData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar datos. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }
  
  const aplicarFiltros = () => {
    let filtradas = [...ventas]
    
    // Filtro por producto
    if (filtroProducto) {
      filtradas = filtradas.filter(v => v.producto_id === filtroProducto)
    }
    
    // Filtro por cliente
    if (filtroCliente) {
      filtradas = filtradas.filter(v => 
        v.cliente && v.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
      )
    }
    
    // Filtro por rango de fechas
    if (filtroFechaInicio) {
      filtradas = filtradas.filter(v => new Date(v.fecha) >= new Date(filtroFechaInicio))
    }
    
    if (filtroFechaFin) {
      filtradas = filtradas.filter(v => new Date(v.fecha) <= new Date(filtroFechaFin))
    }
    
    // Búsqueda general
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtradas = filtradas.filter(v =>
        (v.productos?.nombre || '').toLowerCase().includes(busquedaLower) ||
        (v.cliente || '').toLowerCase().includes(busquedaLower) ||
        v.total?.toString().includes(busquedaLower)
      )
    }
    
    setVentasFiltradas(filtradas)
  }
  
  const limpiarFiltros = () => {
    setFiltroProducto('')
    setFiltroCliente('')
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    setBusqueda('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const producto = productos.find(p => p.id === formData.producto_id)
      if (!producto) return
      
      const venta = {
        producto_id: formData.producto_id,
        cantidad: formData.cantidad,
        precio_unitario: producto.precio,
        total: producto.precio * formData.cantidad,
        fecha: new Date().toISOString(),
        cliente: formData.cliente
      }
      
      await ventasAPI.create(venta)
      await loadData()
      setShowModal(false)
      setFormData({ producto_id: '', cantidad: 1, cliente: '' })
    } catch (error) {
      console.error('Error al registrar venta:', error)
      alert('Error al registrar venta')
    }
  }
  
  const handleExportPDF = () => {
    const datosExportar = ventasFiltradas.map(v => ({
      fecha: new Date(v.fecha).toLocaleDateString(),
      producto: v.productos?.nombre || 'N/A',
      cantidad: v.cantidad,
      precio_unitario: v.precio_unitario,
      total: v.total,
      cliente: v.cliente || 'N/A'
    }))
    
    exportToPDF(datosExportar, 'ventas_filtradas', 'Reporte de Ventas Filtradas')
  }
  
  const handleExportExcel = () => {
    const datosExportar = ventasFiltradas.map(v => ({
      fecha: new Date(v.fecha).toLocaleDateString(),
      producto: v.productos?.nombre || 'N/A',
      cantidad: v.cantidad,
      precio_unitario: v.precio_unitario,
      total: v.total,
      cliente: v.cliente || 'N/A'
    }))
    
    exportToExcel(datosExportar, 'ventas_filtradas')
  }
  
  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando ventas...</span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Ventas</h1>
            <p className="text-gray-600">Controla las ventas de tus productos</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="btn-premium bg-green-600 text-white hover:bg-green-700 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Venta
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Ventas Filtradas</div>
            <div className="text-3xl font-bold text-gray-900">{ventasFiltradas.length}</div>
            <div className="text-xs text-gray-400 mt-1">de {ventas.length} totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Ingresos Filtrados</div>
            <div className="text-3xl font-bold text-green-600">${totalVentas.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Promedio por Venta</div>
            <div className="text-3xl font-bold text-blue-600">
              ${ventasFiltradas.length > 0 ? (totalVentas / ventasFiltradas.length).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda general</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-premium"
                placeholder="Buscar por producto, cliente..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <select
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
                className="input-premium"
              >
                <option value="">Todos los productos</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <input
                type="text"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="input-premium"
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="input-premium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha fin</label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="input-premium"
              />
            </div>
          </div>
          
          {/* Exportar filtrados */}
          <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleExportPDF}
              className="btn-premium bg-red-600 text-white hover:bg-red-700"
              disabled={ventasFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF Filtrado
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-premium bg-green-600 text-white hover:bg-green-700"
              disabled={ventasFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel Filtrado
            </button>
          </div>
        </div>
        
        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">�</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {ventas.length === 0 ? 'No hay ventas registradas' : 'No se encontraron resultados'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {ventas.length === 0 
                            ? 'Comienza registrando tu primera venta'
                            : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                        {ventas.length === 0 && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="btn-premium bg-green-600 text-white hover:bg-green-700"
                          >
                            Registrar Venta
                          </button>
                        )}
                        {ventas.length > 0 && ventasFiltradas.length === 0 && (
                          <button
                            onClick={limpiarFiltros}
                            className="btn-premium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Limpiar Filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id} className="animate-fade-in">
                      <td className="text-gray-900">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </td>
                      <td className="font-medium text-gray-900">
                        {venta.productos?.nombre || 'N/A'}
                      </td>
                      <td className="text-gray-900">{venta.cantidad}</td>
                      <td className="text-gray-900">${venta.precio_unitario.toFixed(2)}</td>
                      <td className="font-bold text-green-600">${venta.total.toFixed(2)}</td>
                      <td className="text-gray-900">{venta.cliente || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
                <p className="text-gray-500 mt-1">Registra una venta de producto</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto *
                  </label>
                  <select
                    required
                    value={formData.producto_id}
                    onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                    className="input-premium"
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - Stock: {producto.stock} - ${producto.precio.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                    className="input-premium"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="input-premium"
                    placeholder="Nombre del cliente"
                  />
                </div>
                
                {formData.producto_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800">
                      <strong>Total estimado:</strong> $
                      {productos.find(p => p.id === formData.producto_id)?.precio 
                        ? (productos.find(p => p.id === formData.producto_id)!.precio * formData.cantidad).toFixed(2)
                        : '0.00'}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-premium bg-green-600 text-white hover:bg-green-700"
                  >
                    Registrar Venta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-premium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}