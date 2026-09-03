'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  useEffect(() => {
    setIsDemoMode(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])
  
  const features = [
    {
      title: 'Productos',
      description: 'Gestiona tu inventario de productos con control de stock en tiempo real',
      icon: '📦',
      href: '/productos',
      color: 'from-blue-500 to-blue-600',
      stats: 'Gestión completa'
    },
    {
      title: 'Ventas',
      description: 'Registra y controla las ventas con actualización automática de inventario',
      icon: '💰',
      href: '/ventas',
      color: 'from-green-500 to-green-600',
      stats: 'Control total'
    },
    {
      title: 'Devoluciones',
      description: 'Controla las devoluciones de productos con reingreso automático al stock',
      icon: '↩️',
      href: '/devoluciones',
      color: 'from-orange-500 to-orange-600',
      stats: 'Tracking eficiente'
    },
    {
      title: 'Recargas',
      description: 'Agrega stock al inventario con registro de proveedores y fechas',
      icon: '📥',
      href: '/recargas',
      color: 'from-purple-500 to-purple-600',
      stats: 'Inventario optimizado'
    },
    {
      title: 'Reportes',
      description: 'Genera reportes detallados en PDF y Excel con un solo clic',
      icon: '📊',
      href: '/reportes',
      color: 'from-red-500 to-red-600',
      stats: 'Exportación fácil'
    }
  ]
  
  const benefits = [
    {
      title: 'Interfaz Intuitiva',
      description: 'Diseñado para ser fácil de usar sin capacitación extensa',
      icon: '✨'
    },
    {
      title: 'Control en Tiempo Real',
      description: 'Actualización automática de stock en cada operación',
      icon: '⚡'
    },
    {
      title: 'Acceso Móvil',
      description: 'Funciona perfectamente en smartphones y tablets',
      icon: '📱'
    },
    {
      title: 'Datos Seguros',
      description: 'Base de datos en la nube con Supabase',
      icon: '🔒'
    },
    {
      title: 'Reportes Instantáneos',
      description: 'Exporta a PDF y Excel en segundos',
      icon: '📄'
    },
    {
      title: 'Sin Costos Ocultos',
      description: 'Solución open-source con despliegue gratuito',
      icon: '💎'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Demo Mode Alert */}
        {isDemoMode && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 mb-8 rounded-r-lg shadow-sm animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Modo Demostración</h3>
                <p className="mt-1 text-sm text-amber-700">
                  El sistema está funcionando en modo local sin configurar Supabase. 
                  Los datos se guardarán en el navegador. Para usar la base de datos en la nube, 
                  configura las variables de entorno siguiendo las instrucciones en 
                  <code className="mx-1 bg-amber-100 px-2 py-0.5 rounded text-amber-900 font-mono text-xs">
                    INSTRUCCIONES_SUPABASE.md
                  </code>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-2xl opacity-20" />
              <Image
                src="/logo.png"
                alt="Logo San Cristóbal"
                width={140}
                height={140}
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Sistema de Inventario
          </h1>
          <p className="text-2xl text-blue-600 font-medium mb-6">
            San Cristóbal
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gestión simple y eficiente de inventario con control en tiempo real, 
            reportes automáticos y acceso desde cualquier dispositivo.
          </p>
          
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/productos"
              className="btn-premium bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-base"
            >
              Comenzar Ahora
            </Link>
            <Link
              href="/reportes"
              className="btn-premium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-8 py-3 text-base"
            >
              Ver Demo
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h2>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {feature.stats}
                  </span>
                  <span className="text-blue-600 font-medium group-hover:translate-x-2 transition-transform flex items-center">
                    Acceder
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Benefits Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestro sistema?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diseñado pensando en la simplicidad y eficiencia, sin sacrificar funcionalidades profesionales.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para optimizar tu inventario?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Comienza a gestionar tus productos, ventas y recargas de manera profesional hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Crear Primer Producto
            </Link>
            <Link
              href="/ventas"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
            >
              Registrar Venta
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Desarrollado con ❤️ para San Cristóbal • Potenciado por Next.js, Supabase y Vercel
          </p>
        </div>
      </div>
    </div>
  )
}