# Instrucciones para Despliegue en GitHub y Vercel

## 1. Preparar el repositorio en GitHub

### Paso 1: Inicializar Git
```bash
cd inventario-system
git init
git add .
git commit -m "Initial commit - Sistema de Inventario San Cristóbal"
```

### Paso 2: Crear repositorio en GitHub
1. Ve a https://github.com y crea un nuevo repositorio
2. Nombre sugerido: `inventario-san-cristobal`
3. No inicialices con README (ya tenemos uno)

### Paso 3: Conectar y subir
```bash
git remote add origin https://github.com/TU_USUARIO/inventario-san-cristobal.git
git branch -M main
git push -u origin main
```

## 2. Configurar Supabase para Producción

### Paso 1: Obtener credenciales de producción
1. En tu proyecto de Supabase, ve a Settings > API
2. Copia:
   - Project URL
   - anon public key

### Paso 2: Configurar variables de entorno en Vercel
1. Ve a https://vercel.com e inicia sesión con GitHub
2. Crea un nuevo proyecto
3. Importa tu repositorio de GitHub
4. En la configuración del proyecto, ve a Settings > Environment Variables
5. Agrega las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu anon key de Supabase

## 3. Desplegar en Vercel

### Opción A: Desde la interfaz de Vercel
1. En Vercel, haz clic en "Add New Project"
2. Selecciona tu repositorio `inventario-san-cristobal`
3. Configura:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Haz clic en "Deploy"

### Opción B: Desde la línea de comandos
```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones en pantalla.

## 4. Configurar dominio personal (opcional)

1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio personal
3. Configura los DNS según las instrucciones de Vercel

## 5. Verificar el despliegue

1. Ve a la URL que te proporcionó Vercel
2. Verifica que todas las funcionalidades funcionen:
   - Crear productos
   - Registrar ventas
   - Registrar devoluciones
   - Registrar recargas
   - Generar reportes
   - Exportar a PDF y Excel

## 6. Archivo .env.local local

No subas el archivo `.env.local` a GitHub. Este archivo debe existir solo en tu máquina local para desarrollo.

Para desarrollo local, crea el archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_local
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_local
```

## 7. Notas importantes

- El sistema usa la base de datos de Supabase para almacenar todos los datos
- Las operaciones de stock se actualizan automáticamente
- Los reportes se generan en el cliente (navegador)
- El sistema es responsive y funciona en móviles y desktop
- La paleta de colores está basada en el logo (azul y blanco)

## 8. Mantenimiento

- Para actualizar: `git pull` y Vercel se redeployará automáticamente
- Para agregar nuevas funcionalidades, haz los cambios localmente, commitea y push
- Vercel detectará los cambios y redeployará automáticamente