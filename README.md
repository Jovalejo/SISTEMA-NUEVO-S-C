# Sistema de Inventario - San Cristóbal

Sistema de gestión de inventario simple y fácil de usar, desarrollado con Next.js, TypeScript, Tailwind CSS y Supabase.

## Características

- ✅ Gestión completa de productos (crear, editar, eliminar)
- ✅ Registro de ventas con actualización automática de stock
- ✅ Sistema de devoluciones con reingreso al inventario
- ✅ Sistema de recargas de inventario
- ✅ Exportación de reportes a PDF y Excel
- ✅ Mini reporte con resumen de ventas, devoluciones y recargas
- ✅ Diseño responsive (funciona en móviles y desktop)
- ✅ Interfaz intuitiva y fácil de usar
- ✅ Base de datos en la nube con Supabase
- ✅ Paleta de colores personalizada basada en el logo

## Tecnologías

- **Frontend**: Next.js 15, React, TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase
- **Exportación**: jsPDF, jsPDF-AutoTable, XLSX
- **Despliegue**: Vercel

## Instalación

### Prerrequisitos

1. Node.js instalado
2. Cuenta en Supabase (gratuita)
3. Cuenta en GitHub y Vercel (para despliegue)

### Configuración local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/inventario-san-cristobal.git
   cd inventario-san-cristobal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   
   Sigue las instrucciones detalladas en `INSTRUCCIONES_SUPABASE.md` para:
   - Crear un proyecto en Supabase
   - Configurar las tablas de la base de datos
   - Obtener las credenciales

4. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   
   Ve a [http://localhost:3000](http://localhost:3000)

## Uso del Sistema

### Productos
- **Crear**: Haz clic en "+ Nuevo Producto" y completa el formulario
- **Editar**: Haz clic en "Editar" en cualquier producto
- **Eliminar**: Haz clic en "Eliminar" (requiere confirmación)
- **Stock**: Se muestra con colores (verde: >10, amarillo: 1-10, rojo: 0)

### Ventas
- **Registrar**: Selecciona producto, cantidad y opcionalmente cliente
- **Stock**: Se reduce automáticamente
- **Historial**: Todas las ventas quedan registradas

### Devoluciones
- **Registrar**: Selecciona producto, cantidad y motivo
- **Stock**: Se incrementa automáticamente (devolución al inventario)
- **Historial**: Todas las devoluciones quedan registradas

### Recargas
- **Registrar**: Selecciona producto, cantidad y opcionalmente proveedor
- **Stock**: Se incrementa automáticamente (agregado al inventario)
- **Historial**: Todas las recargas quedan registradas

### Reportes
- **Resumen**: Vista general con estadísticas
- **Exportar PDF**: Genera reporte en formato PDF
- **Exportar Excel**: Genera reporte en formato Excel
- **Filtros**: Por ventas, devoluciones, recargas o completo

## Despliegue en Producción

Sigue las instrucciones detalladas en `INSTRUCCIONES_GITHUB_VERCEL.md` para:

1. Subir el código a GitHub
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente en Vercel

## Estructura del Proyecto

```
inventario-system/
├── src/
│   ├── app/
│   │   ├── productos/       # Gestión de productos
│   │   ├── ventas/          # Registro de ventas
│   │   ├── devoluciones/    # Registro de devoluciones
│   │   ├── recargas/        # Registro de recargas
│   │   ├── reportes/        # Generación de reportes
│   │   ├── layout.tsx       # Layout principal
│   │   ├── page.tsx         # Página de inicio
│   │   └── globals.css      # Estilos globales
│   ├── components/
│   │   └── Navbar.tsx       # Barra de navegación
│   └── lib/
│       ├── supabase.ts      # Configuración de Supabase
│       └── export.ts        # Funciones de exportación
├── public/
│   └── logo.png             # Logo del sistema
└── INSTRUCCIONES_*.md       # Guías de configuración
```

## Personalización

### Colores
Los colores se pueden modificar en `src/app/globals.css`:
- `--primary-blue`: Color principal azul
- `--secondary-blue`: Color secundario azul
- `--light-blue`: Color azul claro

### Logo
Reemplaza `public/logo.png` con tu propio logo.

## Soporte

Para problemas o preguntas:
1. Revisa las instrucciones en los archivos `INSTRUCCIONES_*.md`
2. Verifica la configuración de Supabase
3. Revisa las variables de entorno

## Licencia

Este proyecto fue desarrollado para San Cristóbal. Uso interno.

## Créditos

Desarrollado con Next.js, Supabase y tecnologías web modernas.
