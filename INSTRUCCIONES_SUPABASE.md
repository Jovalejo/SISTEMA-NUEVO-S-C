# Configuración de Supabase

## 🚀 INSTRUCCIONES RÁPIDAS

Para configurar Supabase rápidamente, sigue la guía completa en:
**GUIA_DESPLIEGUE_COMPLETO.md** - Paso 2: Supabase

## 📋 Resumen del Proceso

### 1. Crear Proyecto en Supabase
1. Ve a https://supabase.com
2. Crea cuenta gratuita
3. Crea nuevo proyecto: `inventario-san-cristobal`

### 2. Crear Tablas (SQL Script)
En el SQL Editor de Supabase, ejecuta este script:

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

### 3. Obtener Credenciales
1. En tu proyecto de Supabase: Settings → API
2. Copia:
   - **Project URL**
   - **anon public key**

### 4. Configurar Variables de Entorno
Crea `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## ⚠️ NOTA IMPORTANTE

Para el despliegue en Vercel, configura las variables de entorno en:
Vercel → Settings → Environment Variables

No subas el archivo `.env.local` a GitHub (ya está en .gitignore).