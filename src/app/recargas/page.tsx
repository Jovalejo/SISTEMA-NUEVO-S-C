'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { recargasAPI, productosAPI, type Recarga, type Producto } from '@/lib/supabase'
import { exportToPDF, exportToExcel } from '@/lib/export'

export default function RecargasPage() {
  const [recargas, setRecargas] = useState<any[]>([])
  const [recargasFiltradas, setRecargasFiltradas] = useState<any[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: 1,
    proveedor: ''
  })
  
  // Filtros
  const [filtroProducto, setFiltroProducto] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [busqueda, setBusqueda] = useState('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    aplicarFiltros()
  }, [recargas, filtroProducto, filtroProveedor, filtroFechaInicio, filtroFechaFin, busqueda])
  
  const loadData = async () => {
    try {
      const [recargasData, productosData] = await Promise.all([
        recargasAPI.getAll(),
        productosAPI.getAll()
      ])
      setRecargas(recargasData)
      setRecargasFiltradas(recargasData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar datos. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }
  
  const aplicarFiltros = () => {
    let filtradas = [...recargas]
    
    // Filtro por producto
    if (filtroProducto) {
      filtradas = filtradas.filter(r => r.producto_id === filtroProducto)
    }
    
    // Filtro por proveedor
    if (filtroProveedor) {
      filtradas = filtradas.filter(r => 
        r.proveedor && r.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase())
      )
    }
    
    // Filtro por rango de fechas
    if (filtroFechaInicio) {
      filtradas = filtradas.filter(r => new Date(r.fecha) >= new Date(filtroFechaInicio))
    }
    
    if (filtroFechaFin) {
      filtradas = filtradas.filter(r => new Date(r.fecha) <= new Date(filtroFechaFin))
    }
    
    // Búsqueda general
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtradas = filtradas.filter(r =>
        (r.productos?.nombre || '').toLowerCase().includes(busquedaLower) ||
        (r.proveedor || '').toLowerCase().includes(busquedaLower)
      )
    }
    
    setRecargasFiltradas(filtradas)
  }
  
  const limpiarFiltros = () => {
    setFiltroProducto('')
    setFiltroProveedor('')
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    setBusqueda('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const recarga = {
        producto_id: formData.producto_id,
        cantidad: formData.cantidad,
        proveedor: formData.proveedor,
        fecha: new Date().toISOString()
      }
      
      await recargasAPI.create(recarga)
      await loadData()
      setShowModal(false)
      setFormData({ producto_id: '', cantidad: 1, proveedor: '' })
    } catch (error) {
      console.error('Error al registrar recarga:', error)
      alert('Error al registrar recarga')
    }
  }
  
  const handleExportPDF = () => {
    const datosExportar = recargasFiltradas.map(r => ({
      fecha: new Date(r.fecha).toLocaleDateString(),
      producto: r.productos?.nombre || 'N/A',
      cantidad: r.cantidad,
      proveedor: r.proveedor || 'N/A'
    }))
    
    exportToPDF(datosExportar, 'recargas_filtradas', 'Reporte de Recargas Filtradas')
  }
  
  const handleExportExcel = () => {
    const datosExportar = recargasFiltradas.map(r => ({
      fecha: new Date(r.fecha).toLocaleDateString(),
      producto: r.productos?.nombre || 'N/A',
      cantidad: r.cantidad,
      proveedor: r.proveedor || 'N/A'
    }))
    
    exportToExcel(datosExportar, 'recargas_filtradas')
  }
  
  const totalRecargas = recargasFiltradas.reduce((sum, r) => sum + r.cantidad, 0)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando recargas...</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Recargas</h1>
            <p className="text-gray-600">Agrega stock a tu inventario</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-premium bg-purple-600 text-white hover:bg-purple-700 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Recarga
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Recargas Filtradas</div>
            <div className="text-3xl font-bold text-gray-900">{recargasFiltradas.length}</div>
            <div className="text-xs text-gray-400 mt-1">de {recargas.length} totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Unidades Agregadas</div>
            <div className="text-3xl font-bold text-purple-600">+{totalRecargas}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Proveedores</div>
            <div className="text-3xl font-bold text-blue-600">
              {new Set(recargasFiltradas.filter(r => r.proveedor).map(r => r.proveedor)).size}
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
                placeholder="Buscar por producto, proveedor..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <input
                type="text"
                value={filtroProveedor}
                onChange={(e) => setFiltroProveedor(e.target.value)}
                className="input-premium"
                placeholder="Nombre del proveedor"
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
              disabled={recargasFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF Filtrado
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-premium bg-green-600 text-white hover:bg-green-700"
              disabled={recargasFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel Filtrado
            </button>
          </div>
        </div>
        
        {/* Restocks Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {recargasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {recargas.length === 0 ? 'No hay recargas registradas' : 'No se encontraron resultados'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {recargas.length === 0 
                            ? 'Agrega stock a tu inventario registrando recargas'
                            : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                        {recargas.length === 0 && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="btn-premium bg-purple-600 text-white hover:bg-purple-700"
                          >
                            Registrar Recarga
                          </button>
                        )}
                        {recargas.length > 0 && recargasFiltradas.length === 0 && (
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
                  recargasFiltradas.map((recarga) => (
                    <tr key={recarga.id} className="animate-fade-in">
                      <td className="text-gray-900">
                        {new Date(recarga.fecha).toLocaleDateString()}
                      </td>
                      <td className="font-medium text-gray-900">
                        {recarga.productos?.nombre || 'N/A'}
                      </td>
                      <td className="font-bold text-purple-600">+{recarga.cantidad}</td>
                      <td className="text-gray-900">{recarga.proveedor || 'N/A'}</td>
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
                <h2 className="text-2xl font-bold text-gray-900">Nueva Recarga</h2>
                <p className="text-gray-500 mt-1">Agrega stock a un producto existente</p>
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
                        {producto.nombre} - Stock actual: {producto.stock}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a agregar *
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
                    Proveedor (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="input-premium"
                    placeholder="Nombre del proveedor"
                  />
                </div>
                
                {formData.producto_id && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-800">
                      <strong>Nuevo stock:</strong> {
                        productos.find(p => p.id === formData.producto_id)?.stock 
                        ? productos.find(p => p.id === formData.producto_id)!.stock + formData.cantidad
                        : formData.cantidad
                      } unidades
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-premium bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Registrar Recarga
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