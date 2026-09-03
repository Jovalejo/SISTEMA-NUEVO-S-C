'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { devolucionesAPI, productosAPI, type Devolucion, type Producto } from '@/lib/supabase'
import { exportToPDF, exportToExcel } from '@/lib/export'

export default function DevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [devolucionesFiltradas, setDevolucionesFiltradas] = useState<any[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: '',
    cantidad: 1,
    motivo: ''
  })
  
  // Filtros
  const [filtroProducto, setFiltroProducto] = useState('')
  const [filtroMotivo, setFiltroMotivo] = useState('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [busqueda, setBusqueda] = useState('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    aplicarFiltros()
  }, [devoluciones, filtroProducto, filtroMotivo, filtroFechaInicio, filtroFechaFin, busqueda])
  
  const loadData = async () => {
    try {
      const [devolucionesData, productosData] = await Promise.all([
        devolucionesAPI.getAll(),
        productosAPI.getAll()
      ])
      setDevoluciones(devolucionesData)
      setDevolucionesFiltradas(devolucionesData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar datos. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }
  
  const aplicarFiltros = () => {
    let filtradas = [...devoluciones]
    
    // Filtro por producto
    if (filtroProducto) {
      filtradas = filtradas.filter(d => d.producto_id === filtroProducto)
    }
    
    // Filtro por motivo
    if (filtroMotivo) {
      filtradas = filtradas.filter(d => 
        d.motivo && d.motivo.toLowerCase().includes(filtroMotivo.toLowerCase())
      )
    }
    
    // Filtro por rango de fechas
    if (filtroFechaInicio) {
      filtradas = filtradas.filter(d => new Date(d.fecha) >= new Date(filtroFechaInicio))
    }
    
    if (filtroFechaFin) {
      filtradas = filtradas.filter(d => new Date(d.fecha) <= new Date(filtroFechaFin))
    }
    
    // Búsqueda general
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtradas = filtradas.filter(d =>
        (d.productos?.nombre || '').toLowerCase().includes(busquedaLower) ||
        (d.motivo || '').toLowerCase().includes(busquedaLower)
      )
    }
    
    setDevolucionesFiltradas(filtradas)
  }
  
  const limpiarFiltros = () => {
    setFiltroProducto('')
    setFiltroMotivo('')
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    setBusqueda('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const devolucion = {
        producto_id: formData.producto_id,
        cantidad: formData.cantidad,
        motivo: formData.motivo,
        fecha: new Date().toISOString()
      }
      
      await devolucionesAPI.create(devolucion)
      await loadData()
      setShowModal(false)
      setFormData({ producto_id: '', cantidad: 1, motivo: '' })
    } catch (error) {
      console.error('Error al registrar devolución:', error)
      alert('Error al registrar devolución')
    }
  }
  
  const handleExportPDF = () => {
    const datosExportar = devolucionesFiltradas.map(d => ({
      fecha: new Date(d.fecha).toLocaleDateString(),
      producto: d.productos?.nombre || 'N/A',
      cantidad: d.cantidad,
      motivo: d.motivo
    }))
    
    exportToPDF(datosExportar, 'devoluciones_filtradas', 'Reporte de Devoluciones Filtradas')
  }
  
  const handleExportExcel = () => {
    const datosExportar = devolucionesFiltradas.map(d => ({
      fecha: new Date(d.fecha).toLocaleDateString(),
      producto: d.productos?.nombre || 'N/A',
      cantidad: d.cantidad,
      motivo: d.motivo
    }))
    
    exportToExcel(datosExportar, 'devoluciones_filtradas')
  }
  
  const totalDevoluciones = devolucionesFiltradas.reduce((sum, d) => sum + d.cantidad, 0)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando devoluciones...</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Devoluciones</h1>
            <p className="text-gray-600">Controla las devoluciones de productos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-premium bg-orange-600 text-white hover:bg-orange-700 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Devolución
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Devoluciones Filtradas</div>
            <div className="text-3xl font-bold text-gray-900">{devolucionesFiltradas.length}</div>
            <div className="text-xs text-gray-400 mt-1">de {devoluciones.length} totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Unidades Devueltas</div>
            <div className="text-3xl font-bold text-orange-600">{totalDevoluciones}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Productos Afectados</div>
            <div className="text-3xl font-bold text-blue-600">
              {new Set(devolucionesFiltradas.map(d => d.producto_id)).size}
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
                placeholder="Buscar por producto, motivo..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
              <input
                type="text"
                value={filtroMotivo}
                onChange={(e) => setFiltroMotivo(e.target.value)}
                className="input-premium"
                placeholder="Buscar en motivos"
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
              disabled={devolucionesFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF Filtrado
            </button>
            <button
              onClick={handleExportExcel}
              className="btn-premium bg-green-600 text-white hover:bg-green-700"
              disabled={devolucionesFiltradas.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel Filtrado
            </button>
          </div>
        </div>
        
        {/* Returns Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {devolucionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {devoluciones.length === 0 ? 'No hay devoluciones registradas' : 'No se encontraron resultados'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {devoluciones.length === 0 
                            ? 'Registra devoluciones cuando sea necesario'
                            : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                        {devoluciones.length === 0 && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="btn-premium bg-orange-600 text-white hover:bg-orange-700"
                          >
                            Registrar Devolución
                          </button>
                        )}
                        {devoluciones.length > 0 && devolucionesFiltradas.length === 0 && (
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
                  devolucionesFiltradas.map((devolucion) => (
                    <tr key={devolucion.id} className="animate-fade-in">
                      <td className="text-gray-900">
                        {new Date(devolucion.fecha).toLocaleDateString()}
                      </td>
                      <td className="font-medium text-gray-900">
                        {devolucion.productos?.nombre || 'N/A'}
                      </td>
                      <td className="text-gray-900">{devolucion.cantidad}</td>
                      <td className="text-gray-900 max-w-xs truncate" title={devolucion.motivo}>
                        {devolucion.motivo}
                      </td>
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
                <h2 className="text-2xl font-bold text-gray-900">Nueva Devolución</h2>
                <p className="text-gray-500 mt-1">Registra la devolución de un producto</p>
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
                        {producto.nombre}
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
                    Motivo de la devolución *
                  </label>
                  <textarea
                    required
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    rows={4}
                    className="input-premium resize-none"
                    placeholder="Describe el motivo de la devolución..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-premium bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Registrar Devolución
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