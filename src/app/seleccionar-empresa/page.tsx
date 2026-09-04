'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SeleccionarEmpresaPage() {
  const router = useRouter()
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null)
  
  const empresas = [
    {
      id: 'sancristobal',
      nombre: 'San Cristóbal',
      descripcion: 'Comercializadora Inversiones El Esfuerzo',
      logo: '/logo.png',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'elvigia',
      nombre: 'El Vigía',
      descripcion: 'Sistema de inventario',
      logo: '/logo.png',
      color: 'from-purple-500 to-purple-600'
    }
  ]
  
  const handleSeleccion = (empresaId: string) => {
    setSelectedEmpresa(empresaId)
    localStorage.setItem('selectedEmpresa', empresaId)
    
    // Redirigir al dashboard después de un breve delay
    setTimeout(() => {
      router.push('/')
    }, 500)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seleccionar Empresa
          </h1>
          <p className="text-gray-600 text-lg">
            Elige la empresa para gestionar su inventario
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              onClick={() => handleSeleccion(empresa.id)}
              disabled={selectedEmpresa !== null}
              className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 p-8 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${empresa.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${empresa.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Image
                      src={empresa.logo}
                      alt={empresa.nombre}
                      width={40}
                      height={40}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {empresa.nombre}
                </h2>
                
                <p className="text-gray-600 mb-4">
                  {empresa.descripcion}
                </p>
                
                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                  {selectedEmpresa === empresa.id ? 'Seleccionando...' : 'Seleccionar'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('isAuthenticated')
              localStorage.removeItem('userEmail')
              localStorage.removeItem('selectedEmpresa')
              router.push('/login')
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Volver al login
          </button>
        </div>
      </div>
    </div>
  )
}
