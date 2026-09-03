'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { productosAPI, type Producto } from '@/lib/supabase'
import { exportToPDF, exportToExcel } from '@/lib/export'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: 0,
    precio: 0,
    categoria: ''
  })
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStock, setFiltroStock] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([])
  
  useEffect(() => {
    loadProductos()
  }, [])
  
  useEffect(() => {
    aplicarFiltros()
  }, [productos, filtroCategoria, filtroStock, busqueda])
  
  const loadProductos = async () => {
    try {
      const data = await productosAPI.getAll()
      setProductos(data)
      setProductosFiltrados(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error al cargar productos. Verifica la conexión con Supabase.')
    } finally {
      setLoading(false)
    }
  }
  
  const aplicarFiltros = () => {
    let filtrados = [...productos]
    
    // Filtro por categoría
    if (filtroCategoria) {
      filtrados = filtrados.filter(p => 
        p.categoria.toLowerCase().includes(filtroCategoria.toLowerCase())
      )
    }
    
    // Filtro por stock
    if (filtroStock === 'bajo') {
      filtrados = filtrados.filter(p => p.stock > 0 && p.stock <= 10)
    } else if (filtroStock === 'agotado') {
      filtrados = filtrados.filter(p => p.stock === 0)
    } else if (filtroStock === 'disponible') {
      filtrados = filtrados.filter(p => p.stock > 10)
    }
    
    // Búsqueda general
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.descripcion.toLowerCase().includes(busquedaLower) ||
        p.categoria.toLowerCase().includes(busquedaLower)
      )
    }
    
    setProductosFiltrados(filtrados)
  }
  
  const limpiarFiltros = () => {
    setFiltroCategoria('')
    setFiltroStock('')
    setBusqueda('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProducto) {
        await productosAPI.update(editingProducto.id!, formData)
      } else {
        await productosAPI.create(formData)
      }
      await loadProductos()
      setShowModal(false)
      setEditingProducto(null)
      setFormData({ nombre: '', descripcion: '', stock: 0, precio: 0, categoria: '' })
    } catch (error) {
      console.error('Error al guardar producto:', error)
      alert('Error al guardar producto')
    }
  }
  
  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      stock: producto.stock,
      precio: producto.precio,
      categoria: producto.categoria
    })
    setShowModal(true)
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productosAPI.delete(id)
        await loadProductos()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        alert('Error al eliminar producto')
      }
    }
  }
  
  const openModal = () => {
    setEditingProducto(null)
    setFormData({ nombre: '', descripcion: '', stock: 0, precio: 0, categoria: '' })
    setShowModal(true)
  }
  
  const getStockBadge = (stock: number) => {
    if (stock > 10) return 'bg-green-100 text-green-800 border-green-200'
    if (stock > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }
  
  const handleExportPDF = () => {
    const datosExportar = productosFiltrados.map(p => ({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      stock: p.stock,
      precio: p.precio,
      valor_total: p.stock * p.precio
    }))
    
    exportToPDF(datosExportar, 'inventario_total', 'Inventario Total')
  }
  
  const handleExportExcel = () => {
    const datosExportar = productosFiltrados.map(p => ({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      stock: p.stock,
      precio: p.precio,
      valor_total: p.stock * p.precio
    }))
    
    exportToExcel(datosExportar, 'inventario_total')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Cargando productos...</span>
          </div>
        </div>
      </div>
    )
  }
  
  const valorTotalInventario = productosFiltrados.reduce((sum, p) => sum + (p.stock * p.precio), 0)
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra tu inventario de productos</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openModal}
              className="btn-premium bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Producto
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Productos Filtrados</div>
            <div className="text-3xl font-bold text-gray-900">{productosFiltrados.length}</div>
            <div className="text-xs text-gray-400 mt-1">de {productos.length} totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Stock Bajo</div>
            <div className="text-3xl font-bold text-yellow-600">
              {productosFiltrados.filter(p => p.stock > 0 && p.stock <= 10).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Sin Stock</div>
            <div className="text-3xl font-bold text-red-600">
              {productosFiltrados.filter(p => p.stock === 0).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Valor Inventario</div>
            <div className="text-3xl font-bold text-blue-600">${valorTotalInventario.toFixed(2)}</div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda general</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-premium"
                placeholder="Buscar por nombre, descripción..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <input
                type="text"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="input-premium"
                placeholder="Filtrar por categoría"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado Stock</label>
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
                className="input-premium"
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible (+10)</option>
                <option value="bajo">Stock bajo (1-10)</option>
                <option value="agotado">Sin stock (0)</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="flex space-x-3 w-full">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 btn-premium bg-red-600 text-white hover:bg-red-700"
                  disabled={productosFiltrados.length === 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 btn-premium bg-green-600 text-white hover:bg-green-700"
                  disabled={productosFiltrados.length === 0}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th>Valor Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">�</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {productos.length === 0 ? 'No hay productos registrados' : 'No se encontraron resultados'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {productos.length === 0 
                            ? 'Comienza agregando tu primer producto al inventario'
                            : 'Intenta ajustar los filtros de búsqueda'}
                        </p>
                        {productos.length === 0 && (
                          <button
                            onClick={openModal}
                            className="btn-premium bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Agregar Producto
                          </button>
                        )}
                        {productos.length > 0 && productosFiltrados.length === 0 && (
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
                  productosFiltrados.map((producto) => (
                    <tr key={producto.id} className="animate-fade-in">
                      <td>
                        <div className="font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.descripcion}</div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {producto.categoria}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStockBadge(producto.stock)} border`}>
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td className="font-semibold text-gray-900">
                          ${producto.precio.toFixed(2)}
                      </td>
                      <td className="font-semibold text-blue-600">
                          ${(producto.stock * producto.precio).toFixed(2)}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(producto)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-gray-500 mt-1">
                  {editingProducto ? 'Actualiza la información del producto' : 'Completa los datos para agregar un nuevo producto'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input-premium"
                    placeholder="Ej: Camiseta Básica"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="input-premium"
                    placeholder="Descripción breve del producto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="input-premium"
                    placeholder="Ej: Ropa, Electrónica, Alimentos"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Inicial *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="input-premium"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                      className="input-premium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-premium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {editingProducto ? 'Actualizar Producto' : 'Crear Producto'}
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