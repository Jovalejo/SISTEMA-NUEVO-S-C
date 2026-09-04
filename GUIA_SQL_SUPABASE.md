# 🗄️ Guía SQL Editor - Supabase

## 📋 PASO 1: Acceder al SQL Editor

1. Ve a https://supabase.com e inicia sesión
2. Selecciona tu proyecto: `inventario-san-cristobal`
3. En el menú izquierdo, haz clic en **SQL Editor** (icono de código SQL)
4. Haz clic en **"New query"** para crear una nueva consulta

## 📝 PASO 2: Copiar y Pegar el Script

Copia todo el siguiente código y pégalo en el SQL Editor:

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

-- Habilitar RLS y crear políticas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a productos" ON productos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso público a ventas" ON ventas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso público a devoluciones" ON devoluciones
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso público a recargas" ON recargas
    FOR ALL USING (true) WITH CHECK (true);
```

## ▶️ PASO 3: Ejecutar el Script

1. Haz clic en el botón **"Run"** (triángulo verde) en la parte superior
2. Espera a que se ejecute (aparecerá "Success" en verde)
3. Verifica que no haya errores en la consola de abajo

## ✅ PASO 4: Verificar las Tablas

1. En el menú izquierdo, haz clic en **Table Editor** (icono de tabla)
2. Deberías ver las tablas creadas:
   - `productos`
   - `ventas`
   - `devoluciones`
   - `recargas`

## 🔑 PASO 5: Obtener Credenciales

1. En el menú izquierdo, haz clic en **Settings** (engranaje)
2. Haz clic en **API**
3. Copia estos dos valores:
   - **Project URL**: algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: algo como `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 PASO 6: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en **Settings** → **Environment Variables**
3. Agrega estas variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: (pega tu Project URL)
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: (pega tu anon public key)
4. Haz clic en **"Save"**
5. Ve a **Deployments** → **Redeploy** para aplicar los cambios

## ⚠️ NOTAS IMPORTANTES

- El script crea automáticamente las relaciones entre tablas
- Las funciones de stock se ejecutan automáticamente al registrar ventas/devoluciones/recargas
- Las políticas RLS permiten acceso público (para desarrollo)
- Los datos se guardarán en la nube de Supabase después de configurar las variables en Vercel

## 🎯 RESULTADO

Una vez completado, tu sistema en Vercel usará la base de datos de Supabase para guardar todos los datos de inventario, ventas, devoluciones y recargas.