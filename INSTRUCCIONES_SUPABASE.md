# Configuración de Supabase

## 1. Crear cuenta en Supabase
1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto llamado "inventario-san-cristobal"

## 2. Crear las tablas en la base de datos

En el SQL Editor de Supabase, ejecuta el siguiente script:

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
```

## 3. Configurar Row Level Security (RLS)

En el SQL Editor de Supabase, ejecuta:

```sql
-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso público (para desarrollo)
-- NOTA: Para producción, usa autenticación proper

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

## 4. Obtener las credenciales

1. En tu proyecto de Supabase, ve a Settings > API
2. Copia:
   - Project URL
   - anon public key

## 5. Configurar el archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Reemplaza los valores con los que copiaste de Supabase.

## 6. Ejecutar el proyecto

```bash
npm run dev
```

El sistema estará disponible en http://localhost:3000