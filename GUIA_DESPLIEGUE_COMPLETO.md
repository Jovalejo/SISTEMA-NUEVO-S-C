# 🚀 Guía Completa de Despliegue - Sistema de Inventario San Cristóbal

## 📋 PASO 1: GitHub

### 1.1 Crear Repositorio en GitHub
1. Ve a https://github.com e inicia sesión
2. Haz clic en el botón **"+"** arriba a la derecha → **"New repository"**
3. Completa los datos:
   - **Repository name**: `inventario-san-cristobal`
   - **Description**: Sistema de gestión de inventario San Cristóbal
   - **Public/Private**: Selecciona según tu preferencia
   - **NO marques** "Add a README file", "Add .gitignore", "Choose a license"
4. Haz clic en **"Create repository"**

### 1.2 Subir Código a GitHub
En tu terminal, ejecuta estos comandos (reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub):

```bash
cd "C:\Users\Orlando Rolon\Desktop\SISTEMA INVENTARIO\inventario-system"
git remote add origin https://github.com/TU_USUARIO/inventario-san-cristobal.git
git branch -M main
git push -u origin main
```

**Nota**: Si te pide usuario y contraseña, usa tu **Personal Access Token** de GitHub (Settings → Developer settings → Personal access tokens → Generate new token).

---

## 🗄️ PASO 2: Supabase

### 2.1 Crear Proyecto en Supabase
1. Ve a https://supabase.com y crea una cuenta gratuita
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `inventario-san-cristobal`
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a tu ubicación
4. Espera a que se cree el proyecto (2-3 minutos)

### 2.2 Crear Tablas en la Base de Datos
1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de SQL en el menú izquierdo)
2. Copia y pega este script completo:

```sql
-- Tabla de productos
CREATE TABLE productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    stock INTEGER DEFAULT 0,
    precio NUMERIC DEFAULT 0,
    categoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cliente TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de devoluciones
CREATE TABLE devoluciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id),
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recargas
CREATE TABLE recargas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    proveedor TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funciones para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION actualizar_stock_venta(p_producto_id UUID, p_cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos 
    SET stock = stock - p_cantidad
    WHERE id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_stock_devolucion(p_producto_id UUID, p_cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos 
    SET stock = stock + p_cantidad
    WHERE id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_stock_recarga(p_producto_id UUID, p_cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos 
    SET stock = stock + p_cantidad
    WHERE id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS (Row Level Security)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (para desarrollo)
CREATE POLICY "Permitir acceso público a productos" ON productos
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acceso público a ventas" ON ventas
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acceso público a devoluciones" ON devoluciones
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acceso público a recargas" ON recargas
    FOR ALL USING (true)
    WITH CHECK (true);
```

3. Haz clic en **"Run"** para ejecutar el script
4. Verifica que no haya errores

### 2.3 Obtener Credenciales de Supabase
1. En tu proyecto de Supabase, ve a **Settings** (engranaje) → **API**
2. Copia estos valores:
   - **Project URL**: algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: algo como `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ☁️ PASO 3: Vercel

### 3.1 Crear Cuenta en Vercel
1. Ve a https://vercel.com e inicia sesión con **GitHub**
2. Autoriza Vercel a acceder a tu cuenta de GitHub

### 3.2 Desplegar el Proyecto
1. En Vercel, haz clic en **"Add New Project"** → **"Continue with GitHub"**
2. Busca y selecciona tu repositorio `inventario-san-cristobal`
3. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (dejar vacío)
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)
4. Haz clic en **"Deploy"**

### 3.3 Configurar Variables de Entorno en Vercel
1. Después del primer despliegue, ve a **Settings** → **Environment Variables**
2. Agrega estas variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: tu Project URL de Supabase
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: tu anon public key de Supabase
3. Haz clic en **"Save"**
4. Ve a **Deployments** → **Redeploy** para aplicar los cambios

### 3.4 Obtener URL del Proyecto
1. En Vercel, tu proyecto estará en una URL como: `https://inventario-san-cristobal.vercel.app`
2. Copia esta URL para compartirla

---

## ✅ PASO 4: Verificar Funcionamiento

### 4.1 Probar el Sistema en Producción
1. Abre la URL de Vercel en tu navegador
2. Verifica que funcione:
   - Crear un producto
   - Registrar una venta
   - Registrar una devolución
   - Registrar una recarga
   - Probar los filtros
   - Exportar un reporte en PDF
   - Exportar un reporte en Excel

### 4.2 Probar Modo Local (Opcional)
Si quieres probar localmente con Supabase:
1. Crea un archivo `.env.local` en la carpeta del proyecto
2. Agrega las mismas variables de entorno:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```
3. Ejecuta `npm run dev`

---

## 🎯 Resumen Final

**Tendrás:**
- ✅ Código en GitHub: `https://github.com/TU_USUARIO/inventario-san-cristobal`
- ✅ Sistema desplegado en Vercel: `https://inventario-san-cristobal.vercel.app`
- ✅ Base de datos en Supabase con todas las tablas configuradas
- ✅ Sistema completamente funcional con filtros y exportación

**El sistema incluye:**
- 📦 Gestión completa de productos
- 💰 Registro de ventas con actualización de stock
- ↩️ Sistema de devoluciones
- 📥 Sistema de recargas
- 🔍 Filtrado avanzado por fechas y productos
- 📄 Exportación a PDF y Excel
- 📊 Reportes automáticos
- 📱 Diseño responsive

¡Tu sistema de inventario San Cristóbal estará en línea y listo para usar! 🚀