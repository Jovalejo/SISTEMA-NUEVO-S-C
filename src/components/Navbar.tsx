'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const empresa = localStorage.getItem('selectedEmpresa')
      setSelectedEmpresa(empresa)
    }
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('selectedEmpresa')
    router.push('/login')
  }
  
  const getEmpresaNombre = () => {
    if (selectedEmpresa === 'sancristobal') return 'San Cristóbal'
    if (selectedEmpresa === 'elvigia') return 'El Vigía'
    return 'Sistema de Inventario'
  }
  
  const navItems = [
    { href: '/', label: 'Inicio', icon: '🏠', description: 'Panel principal' },
    { href: '/productos', label: 'Productos', icon: '📦', description: 'Gestionar inventario' },
    { href: '/ventas', label: 'Ventas', icon: '💰', description: 'Registrar ventas' },
    { href: '/devoluciones', label: 'Devoluciones', icon: '↩️', description: 'Controlar devoluciones' },
    { href: '/recargas', label: 'Recargas', icon: '📥', description: 'Agregar stock' },
    { href: '/reportes', label: 'Reportes', icon: '📊', description: 'Exportar datos' },
  ]
  
  // No mostrar navbar en páginas de login
  if (pathname === '/login' || pathname === '/seleccionar-empresa') {
    return null
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - solo el icono sin texto */}
          <Link href="/" className="flex items-center group">
            <div className="relative" style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={44}
                height={44}
                className="rounded-lg shadow-md transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-offset-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={item.description}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              title="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <span className="text-xl">🚪</span>
              <div>
                <div>Cerrar Sesión</div>
                <div className="text-xs text-gray-400">Salir del sistema</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}