# 🗄️ Script SQL para Soft Delete y Usuarios

## 📋 Este script agrega soft delete y sistema de usuarios

Copia y pega este script en el SQL Editor de Supabase.

```sql
-- Agregar columna soft delete a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS eliminado_at TIMESTAMP WITH TIME ZONE;

-- Crear índice para soft delete
CREATE INDEX IF NOT EXISTS idx_productos_eliminado ON productos(eliminado_at) WHERE eliminado_at IS NOT NULL;

-- Modificar políticas RLS para filtrar productos eliminados
DROP POLICY IF EXISTS "Permitir acceso por empresa a productos" ON productos;

CREATE POLICY "Permitir acceso por empresa a productos" ON productos
    FOR SELECT USING (eliminado_at IS NULL)
    WITH CHECK (true);

-- Crear tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    empresa_id TEXT NOT NULL,
    rol TEXT DEFAULT 'admin',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios de ejemplo
INSERT INTO usuarios_sistema (email, nombre, empresa_id, rol) VALUES
    ('admin@sancristobal.com', 'Admin San Cristóbal', 'sancristobal', 'admin'),
    ('admin@elvigia.com', 'Admin El Vigía', 'elvigia', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS para usuarios_sistema
ALTER TABLE usuarios_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a usuarios_sistema" ON usuarios_sistema
    FOR ALL USING (true) WITH CHECK (true);
```

## 📝 Instrucciones para crear usuarios en Supabase Authentication:

1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Users**
4. Haz clic en **"Add user"**
5. **Usuario San Cristóbal:**
   - Email: `admin@sancristobal.com`
   - Password: (elige una contraseña segura)
   - Auto-confirm user: YES
6. **Usuario El Vigía:**
   - Email: `admin@elvigia.com`
   - Password: (elige una contraseña segura)
   - Auto-confirm user: YES

## ⚠️ IMPORTANTE:

Los emails en Supabase Authentication deben coincidir con los emails en la tabla `usuarios_sistema` del script SQL.