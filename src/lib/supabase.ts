import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Verificar si Supabase está configurado
export const isSupabaseConfigured = !!supabase

// Tipos de datos
export interface Producto {
  id?: string
  nombre: string
  descripcion: string
  stock: number
  precio: number
  categoria: string
  empresa_id?: string
  eliminado_at?: string | null
  created_at?: string
}

export interface Venta {
  id?: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  total: number
  fecha: string
  cliente?: string
  empresa_id?: string
  created_at?: string
}

export interface Devolucion {
  id?: string
  venta_id?: string
  producto_id: string
  cantidad: number
  motivo: string
  fecha: string
  empresa_id?: string
  created_at?: string
}

export interface Recarga {
  id?: string
  producto_id: string
  cantidad: number
  proveedor?: string
  fecha: string
  empresa_id?: string
  created_at?: string
}

// Funciones de almacenamiento local para modo demo con soporte multi-tenant
const getEmpresaPrefix = () => {
  if (typeof window === 'undefined') return 'sancristobal'
  const empresa = localStorage.getItem('selectedEmpresa') || 'sancristobal'
  return empresa
}

const localStorageHelper = {
  getProducts: (): Producto[] => {
    if (typeof window === 'undefined') return []
    const prefix = getEmpresaPrefix()
    const data = localStorage.getItem(`${prefix}_productos`)
    return data ? JSON.parse(data).filter((p: Producto) => !p.eliminado_at) : []
  },
  setProducts: (products: Producto[]) => {
    if (typeof window !== 'undefined') {
      const prefix = getEmpresaPrefix()
      localStorage.setItem(`${prefix}_productos`, JSON.stringify(products))
    }
  },
  getVentas: (): any[] => {
    if (typeof window === 'undefined') return []
    const prefix = getEmpresaPrefix()
    const data = localStorage.getItem(`${prefix}_ventas`)
    return data ? JSON.parse(data) : []
  },
  setVentas: (ventas: any[]) => {
    if (typeof window !== 'undefined') {
      const prefix = getEmpresaPrefix()
      localStorage.setItem(`${prefix}_ventas`, JSON.stringify(ventas))
    }
  },
  getDevoluciones: (): any[] => {
    if (typeof window === 'undefined') return []
    const prefix = getEmpresaPrefix()
    const data = localStorage.getItem(`${prefix}_devoluciones`)
    return data ? JSON.parse(data) : []
  },
  setDevoluciones: (devoluciones: any[]) => {
    if (typeof window !== 'undefined') {
      const prefix = getEmpresaPrefix()
      localStorage.setItem(`${prefix}_devoluciones`, JSON.stringify(devoluciones))
    }
  },
  getRecargas: (): any[] => {
    if (typeof window === 'undefined') return []
    const prefix = getEmpresaPrefix()
    const data = localStorage.getItem(`${prefix}_recargas`)
    return data ? JSON.parse(data) : []
  },
  setRecargas: (recargas: any[]) => {
    if (typeof window !== 'undefined') {
      const prefix = getEmpresaPrefix()
      localStorage.setItem(`${prefix}_recargas`, JSON.stringify(recargas))
    }
  }
}

// Funciones de la API
export const productosAPI = {
  async getAll() {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      return localStorageHelper.getProducts().filter(p => !p.eliminado_at)
    }
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('empresa_id', empresaId)
      .is('eliminado_at', null)
      .order('nombre')
    if (error) throw error
    return data
  },

  async create(producto: Omit<Producto, 'id' | 'created_at'>) {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const newProduct = { ...producto, id: Date.now().toString(), created_at: new Date().toISOString(), empresa_id: empresaId, eliminado_at: null }
      products.push(newProduct)
      localStorageHelper.setProducts(products)
      return newProduct
    }
    const { data, error } = await supabase
      .from('productos')
      .insert({ ...producto, empresa_id: empresaId, eliminado_at: null })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, producto: Partial<Producto>) {
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const index = products.findIndex(p => p.id === id)
      if (index !== -1) {
        products[index] = { ...products[index], ...producto }
        localStorageHelper.setProducts(products)
        return products[index]
      }
      throw new Error('Producto no encontrado')
    }
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const index = products.findIndex(p => p.id === id)
      if (index !== -1) {
        products[index].eliminado_at = new Date().toISOString()
        localStorageHelper.setProducts(products)
      }
      return
    }
    // Soft delete: solo marca como eliminado
    const { error } = await supabase
      .from('productos')
      .update({ eliminado_at: new Date().toISOString() })
      .eq('id', id)
      .eq('empresa_id', empresaId)
    if (error) throw error
  },

  async updateStock(id: string, cantidad: number) {
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const index = products.findIndex(p => p.id === id)
      if (index !== -1) {
        products[index].stock = cantidad
        localStorageHelper.setProducts(products)
        return products[index]
      }
      throw new Error('Producto no encontrado')
    }
    const { data, error } = await supabase
      .from('productos')
      .update({ stock: cantidad })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export const ventasAPI = {
  async getAll() {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const ventas = localStorageHelper.getVentas()
      const products = localStorageHelper.getProducts()
      return ventas.map(v => ({
        ...v,
        productos: products.find(p => p.id === v.producto_id)
      }))
    }
    const { data, error } = await supabase
      .from('ventas')
      .select('*, productos(nombre)')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(venta: Omit<Venta, 'id' | 'created_at'>) {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const ventas = localStorageHelper.getVentas()
      const products = localStorageHelper.getProducts()
      const newVenta = { ...venta, id: Date.now().toString(), created_at: new Date().toISOString(), empresa_id: empresaId }
      ventas.push(newVenta)
      localStorageHelper.setVentas(ventas)
      
      // Actualizar stock localmente
      const productIndex = products.findIndex(p => p.id === venta.producto_id)
      if (productIndex !== -1) {
        products[productIndex].stock -= venta.cantidad
        localStorageHelper.setProducts(products)
      }
      
      return newVenta
    }
    const { data, error } = await supabase
      .from('ventas')
      .insert({ ...venta, empresa_id: empresaId })
      .select()
      .single()
    if (error) throw error
    
    // Actualizar stock
    await supabase.rpc('actualizar_stock_venta', {
      p_producto_id: venta.producto_id,
      p_cantidad: venta.cantidad
    })
    
    return data
  }
}

export const devolucionesAPI = {
  async getAll() {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const devoluciones = localStorageHelper.getDevoluciones()
      const products = localStorageHelper.getProducts()
      return devoluciones.map(d => ({
        ...d,
        productos: products.find(p => p.id === d.producto_id)
      }))
    }
    const { data, error } = await supabase
      .from('devoluciones')
      .select('*, productos(nombre)')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(devolucion: Omit<Devolucion, 'id' | 'created_at'>) {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const devoluciones = localStorageHelper.getDevoluciones()
      const products = localStorageHelper.getProducts()
      const newDevolucion = { ...devolucion, id: Date.now().toString(), created_at: new Date().toISOString(), empresa_id: empresaId }
      devoluciones.push(newDevolucion)
      localStorageHelper.setDevoluciones(devoluciones)
      
      // Actualizar stock localmente (devolver al inventario)
      const productIndex = products.findIndex(p => p.id === devolucion.producto_id)
      if (productIndex !== -1) {
        products[productIndex].stock += devolucion.cantidad
        localStorageHelper.setProducts(products)
      }
      
      return newDevolucion
    }
    const { data, error } = await supabase
      .from('devoluciones')
      .insert({ ...devolucion, empresa_id: empresaId })
      .select()
      .single()
    if (error) throw error
    
    // Actualizar stock (devolver al inventario)
    await supabase.rpc('actualizar_stock_devolucion', {
      p_producto_id: devolucion.producto_id,
      p_cantidad: devolucion.cantidad
    })
    
    return data
  }
}

export const recargasAPI = {
  async getAll() {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const recargas = localStorageHelper.getRecargas()
      const products = localStorageHelper.getProducts()
      return recargas.map(r => ({
        ...r,
        productos: products.find(p => p.id === r.producto_id)
      }))
    }
    const { data, error } = await supabase
      .from('recargas')
      .select('*, productos(nombre)')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(recarga: Omit<Recarga, 'id' | 'created_at'>) {
    const empresaId = getEmpresaPrefix()
    if (!supabase) {
      const recargas = localStorageHelper.getRecargas()
      const products = localStorageHelper.getProducts()
      const newRecarga = { ...recarga, id: Date.now().toString(), created_at: new Date().toISOString(), empresa_id: empresaId }
      recargas.push(newRecarga)
      localStorageHelper.setRecargas(recargas)
      
      // Actualizar stock localmente (agregar al inventario)
      const productIndex = products.findIndex(p => p.id === recarga.producto_id)
      if (productIndex !== -1) {
        products[productIndex].stock += recarga.cantidad
        localStorageHelper.setProducts(products)
      }
      
      return newRecarga
    }
    const { data, error } = await supabase
      .from('recargas')
      .insert({ ...recarga, empresa_id: empresaId })
      .select()
      .single()
    if (error) throw error
    
    // Actualizar stock (agregar al inventario)
    await supabase.rpc('actualizar_stock_recarga', {
      p_producto_id: recarga.producto_id,
      p_cantidad: recarga.cantidad
    })
    
    return data
  }
}