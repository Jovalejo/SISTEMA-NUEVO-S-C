'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = () => {
      // Páginas públicas que no requieren autenticación
      const publicPages = ['/login', '/seleccionar-empresa']
      
      if (publicPages.includes(pathname)) {
        setIsLoading(false)
        return
      }
      
      // Verificar autenticación
      const auth = localStorage.getItem('isAuthenticated')
      const empresa = localStorage.getItem('selectedEmpresa')
      
      if (!auth || !empresa) {
        // Redirigir a login si no está autenticado
        router.push('/login')
        return
      }
      
      setIsAuthenticated(true)
      setIsLoading(false)
    }
    
    checkAuth()
  }, [pathname, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Cargando...</span>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/seleccionar-empresa') {
    return null
  }
  
  return <>{children}</>
}
