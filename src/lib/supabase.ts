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
  created_at?: string
}

export interface Devolucion {
  id?: string
  venta_id?: string
  producto_id: string
  cantidad: number
  motivo: string
  fecha: string
  created_at?: string
}

export interface Recarga {
  id?: string
  producto_id: string
  cantidad: number
  proveedor?: string
  fecha: string
  created_at?: string
}

// Funciones de almacenamiento local para modo demo
const localStorageHelper = {
  getProducts: (): Producto[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('productos')
    return data ? JSON.parse(data) : []
  },
  setProducts: (products: Producto[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productos', JSON.stringify(products))
    }
  },
  getVentas: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('ventas')
    return data ? JSON.parse(data) : []
  },
  setVentas: (ventas: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ventas', JSON.stringify(ventas))
    }
  },
  getDevoluciones: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('devoluciones')
    return data ? JSON.parse(data) : []
  },
  setDevoluciones: (devoluciones: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devoluciones', JSON.stringify(devoluciones))
    }
  },
  getRecargas: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('recargas')
    return data ? JSON.parse(data) : []
  },
  setRecargas: (recargas: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recargas', JSON.stringify(recargas))
    }
  }
}

// Funciones de la API
export const productosAPI = {
  async getAll() {
    if (!supabase) {
      return localStorageHelper.getProducts()
    }
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  },

  async create(producto: Omit<Producto, 'id' | 'created_at'>) {
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const newProduct = { ...producto, id: Date.now().toString(), created_at: new Date().toISOString() }
      products.push(newProduct)
      localStorageHelper.setProducts(products)
      return newProduct
    }
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
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
    if (!supabase) {
      const products = localStorageHelper.getProducts()
      const filtered = products.filter(p => p.id !== id)
      localStorageHelper.setProducts(filtered)
      return
    }
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
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
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(venta: Omit<Venta, 'id' | 'created_at'>) {
    if (!supabase) {
      const ventas = localStorageHelper.getVentas()
      const products = localStorageHelper.getProducts()
      const newVenta = { ...venta, id: Date.now().toString(), created_at: new Date().toISOString() }
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
      .insert(venta)
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
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(devolucion: Omit<Devolucion, 'id' | 'created_at'>) {
    if (!supabase) {
      const devoluciones = localStorageHelper.getDevoluciones()
      const products = localStorageHelper.getProducts()
      const newDevolucion = { ...devolucion, id: Date.now().toString(), created_at: new Date().toISOString() }
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
      .insert(devolucion)
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
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(recarga: Omit<Recarga, 'id' | 'created_at'>) {
    if (!supabase) {
      const recargas = localStorageHelper.getRecargas()
      const products = localStorageHelper.getProducts()
      const newRecarga = { ...recarga, id: Date.now().toString(), created_at: new Date().toISOString() }
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
      .insert(recarga)
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