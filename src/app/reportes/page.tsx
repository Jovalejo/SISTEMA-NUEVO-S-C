'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ventasAPI, devolucionesAPI, recargasAPI, productosAPI } from '@/lib/supabase'
import { exportToPDF, exportToExcel, generateReport } from '@/lib/export'

export default function ReportesPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [devoluciones, setDevoluciones] = useState<any[]>([])
  const [recargas, setRecargas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'ventas' | 'devoluciones' | 'recargas' | 'completo'>('completo')
  
  // Filtros de reportes
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [filtroProducto, setFiltroProducto] = useState('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [ventasData, devolucionesData, recargasData, productosData] = await Promise.all([
        ventasAPI.getAll(),
        devolucionesAPI.getAll(),
        recargasAPI.getAll(),
        productosAPI.getAll()
      ])
      setVentas(ventasData)
      setDevoluciones(devolucionesData)
      setRecargas(recargasData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      alert('Error al cargar datos. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }
  
  const aplicarFiltros = (data: any[]) => {
    let filtrados = [...data]
    
    if (filtroFechaInicio) {
      filtradas = filtradas.filter((d: any) => new Date(d.fecha) >= new Date(filtroFechaInicio))
    }
    
    if (filtroFechaFin) {
      filtradas = filtradas.filter((d: any) => new Date(d.fecha) <= new Date(filtroFechaFin))
    }
    
    if (filtroProducto) {
      filtradas = filtradas.filter((d: any) => d.producto_id === filtroProducto)
    }
    
    return filtradas
  }
  
  const limpiarFiltros = () => {
    setFiltroFechaInicio('')
    setFiltroFechaFin('')
    setFiltroProducto('')
  }
  
  const handleExportPDF = () => {
    const ventasFiltradas = aplicarFiltros(ventas)
    const devolucionesFiltradas = aplicarFiltros(devoluciones)
    const recargasFiltradas = aplicarFiltros(recargas)
    
    const data = selectedTab === 'ventas' ? ventasFiltradas :
                  selectedTab === 'devoluciones' ? devolucionesFiltradas :
                  selectedTab === 'recargas' ? recargasFiltradas :
                  generateReport(ventasFiltradas, devolucionesFiltradas, recargasFiltradas)
    
    const filename = selectedTab === 'completo' ? 'reporte_completo' : `reporte_${selectedTab}`
    const title = selectedTab === 'completo' ? 'Reporte Completo' :
                  selectedTab === 'ventas' ? 'Reporte de Ventas' :
                  selectedTab === 'devoluciones' ? 'Reporte de Devoluciones' :
                  'Reporte de Recargas'
    
    exportToPDF(data, filename, title)
  }
  
  const handleExportExcel = () => {
    const ventasFiltradas = aplicarFiltros(ventas)
    const devolucionesFiltradas = aplicarFiltros(devoluciones)
    const recargasFiltradas = aplicarFiltros(recargas)
    
    const data = selectedTab === 'ventas' ? ventasFiltradas :
                  selectedTab === 'devoluciones' ? devolucionesFiltradas :
                  selectedTab === 'recargas' ? recargasFiltradas :
                  generateReport(ventasFiltradas, devolucionesFiltradas, recargasFiltradas)
    
    const filename = selectedTab === 'completo' ? 'reporte_completo' : `reporte_${selectedTab}`
    exportToExcel(data, filename)
  }
  
  const ventasFiltradas = aplicarFiltros(ventas)
  const devolucionesFiltradas = aplicarFiltros(devoluciones)
  const recargasFiltradas = aplicarFiltros(recargas)
  
  const resumen = {
    totalVentas: ventasFiltradas.length,
    totalDevoluciones: devolucionesFiltradas.length,
    totalRecargas: recargasFiltradas.length,
    montoVentas: ventasFiltradas.reduce((sum: number, v: any) => sum + (v.total || 0), 0)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando reportes...</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Exportación</h1>
          <p className="text-gray-600">Genera y exporta reportes detallados de tu inventario</p>
        </div>
        
        {/* Filtros de reportes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros de Reporte</h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto específico</label>
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
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Total Ventas</div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                💰
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.totalVentas}</div>
            <div className="text-xs text-gray-400 mt-1">Filtrado por fecha</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Total Devoluciones</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                ↩️
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.totalDevoluciones}</div>
            <div className="text-xs text-gray-400 mt-1">Filtrado por fecha</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Total Recargas</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                📥
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.totalRecargas}</div>
            <div className="text-xs text-gray-400 mt-1">Filtrado por fecha</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Monto Ventas</div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                💵
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">${resumen.montoVentas.toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-1">Filtrado por fecha</div>
          </div>
        </div>
        
        {/* Tabs and Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setSelectedTab('completo')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'completo'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>Reporte Completo</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('ventas')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'ventas'
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>💰</span>
                  <span>Ventas</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('devoluciones')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'devoluciones'
                    ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>↩️</span>
                  <span>Devoluciones</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('recargas')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'recargas'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📥</span>
                  <span>Recargas</span>
                </div>
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Export Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleExportPDF}
                className="btn-premium bg-red-600 text-white hover:bg-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF Filtrado
              </button>
              <button
                onClick={handleExportExcel}
                className="btn-premium bg-green-600 text-white hover:bg-green-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Excel Filtrado
              </button>
            </div>
            
            {/* Tab Content */}
            {selectedTab === 'completo' && (
              <div className="space-y-8 animate-fade-in">
                {/* General Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Resumen General Filtrado</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-blue-600 mb-1">Fecha Reporte</div>
                      <div className="font-semibold text-blue-900">{new Date().toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 mb-1">Total Ventas</div>
                      <div className="font-semibold text-blue-900">{resumen.totalVentas}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 mb-1">Total Devoluciones</div>
                      <div className="font-semibold text-blue-900">{resumen.totalDevoluciones}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 mb-1">Total Recargas</div>
                      <div className="font-semibold text-blue-900">{resumen.totalRecargas}</div>
                    </div>
                  </div>
                  {(filtroFechaInicio || filtroFechaFin || filtroProducto) && (
                    <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-blue-700">
                      <strong>Filtros aplicados:</strong> {filtroFechaInicio && `Desde ${filtroFechaInicio}`} {filtroFechaFin && `Hasta ${filtroFechaFin}`} {filtroProducto && `Producto: ${productos.find(p => p.id === filtroProducto)?.nombre || 'Seleccionado'}`}
                    </div>
                  )}
                </div>
                
                {/* Recent Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Sales */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                      <h3 className="font-semibold text-green-900">Últimas Ventas</h3>
                    </div>
                    {ventasFiltradas.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {ventasFiltradas.slice(0, 5).map((venta) => (
                          <div key={venta.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {venta.productos?.nombre || 'N/A'}
                              </div>
                              <div className="font-bold text-green-600 text-sm">
                                ${venta.total?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(venta.fecha).toLocaleDateString()} • {venta.cantidad} unid.
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No hay ventas en el período seleccionado
                      </div>
                    )}
                  </div>
                  
                  {/* Recent Returns */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b border-orange-100">
                      <h3 className="font-semibold text-orange-900">Últimas Devoluciones</h3>
                    </div>
                    {devolucionesFiltradas.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {devolucionesFiltradas.slice(0, 5).map((devolucion) => (
                          <div key={devolucion.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {devolucion.productos?.nombre || 'N/A'}
                              </div>
                              <div className="font-bold text-orange-600 text-sm">
                                {devolucion.cantidad} unid.
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {devolucion.motivo}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No hay devoluciones en el período seleccionado
                      </div>
                    )}
                  </div>
                  
                  {/* Recent Restocks */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                      <h3 className="font-semibold text-purple-900">Últimas Recargas</h3>
                    </div>
                    {recargasFiltradas.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {recargasFiltradas.slice(0, 5).map((recarga) => (
                          <div key={recarga.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {recarga.productos?.nombre || 'N/A'}
                              </div>
                              <div className="font-bold text-purple-600 text-sm">
                                +{recarga.cantidad}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {recarga.proveedor || 'Sin proveedor'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No hay recargas en el período seleccionado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {selectedTab === 'ventas' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Detalle de Ventas Filtradas</h3>
                {ventasFiltradas.length > 0 ? (
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
                        {ventasFiltradas.map((venta: any) => (
                          <tr key={venta.id}>
                            <td className="text-gray-900">{new Date(venta.fecha).toLocaleDateString()}</td>
                            <td className="font-medium text-gray-900">{venta.productos?.nombre || 'N/A'}</td>
                            <td className="text-gray-900">{venta.cantidad}</td>
                            <td className="text-gray-900">${venta.precio_unitario?.toFixed(2) || '0.00'}</td>
                            <td className="font-bold text-green-600">${venta.total?.toFixed(2) || '0.00'}</td>
                            <td className="text-gray-900">{venta.cliente || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No hay ventas en el período seleccionado</p>
                  </div>
                )}
              </div>
            )}
            
            {selectedTab === 'devoluciones' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-orange-700">Detalle de Devoluciones Filtradas</h3>
                {devolucionesFiltradas.length > 0 ? (
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
                        {devolucionesFiltradas.map((devolucion: any) => (
                          <tr key={devolucion.id}>
                            <td className="text-gray-900">{new Date(devolucion.fecha).toLocaleDateString()}</td>
                            <td className="font-medium text-gray-900">{devolucion.productos?.nombre || 'N/A'}</td>
                            <td className="text-gray-900">{devolucion.cantidad}</td>
                            <td className="text-gray-900 max-w-xs truncate" title={devolucion.motivo}>{devolucion.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">↩️</div>
                    <p>No hay devoluciones en el período seleccionado</p>
                  </div>
                )}
              </div>
            )}
            
            {selectedTab === 'recargas' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Detalle de Recargas Filtradas</h3>
                {recargasFiltradas.length > 0 ? (
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
                        {recargasFiltradas.map((recarga: any) => (
                          <tr key={recarga.id}>
                            <td className="text-gray-900">{new Date(recarga.fecha).toLocaleDateString()}</td>
                            <td className="font-medium text-gray-900">{recarga.productos?.nombre || 'N/A'}</td>
                            <td className="font-bold text-purple-600">+{recarga.cantidad}</td>
                            <td className="text-gray-900">{recarga.proveedor || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">📥</div>
                    <p>No hay recargas en el período seleccionado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}