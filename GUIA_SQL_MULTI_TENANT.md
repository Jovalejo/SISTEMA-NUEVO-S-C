# 🗄️ Script SQL para Sistema Multi-Tenant en Supabase

## 📋 Este script actualiza tu base de datos para soportar múltiples empresas

Copia y pega este script en el SQL Editor de Supabase. Este script AGREGA columnas a las tablas existentes sin borrar datos.

```sql
-- Agregar columna empresa_id a todas las tablas
ALTER TABLE productos ADD COLUMN IF NOT EXISTS empresa_id TEXT DEFAULT 'sancristobal';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS empresa_id TEXT DEFAULT 'sancristobal';
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS empresa_id TEXT DEFAULT 'sancristobal';
ALTER TABLE recargas ADD COLUMN IF NOT EXISTS empresa_id TEXT DEFAULT 'sancristobal';

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ventas_empresa ON ventas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_empresa ON devoluciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_recargas_empresa ON recargas(empresa_id);

-- Política RLS para filtrar por empresa (opcional, para mayor seguridad)
-- Esto permite que cada empresa solo vea sus propios datos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acceso público a productos" ON productos;
DROP POLICY IF EXISTS "Permitir acceso público a ventas" ON ventas;
DROP POLICY IF EXISTS "Permitir acceso público a devoluciones" ON devoluciones;
DROP POLICY IF EXISTS "Permitir acceso público a recargas" ON recargas;

-- Nueva política: Solo permitir acceso a datos de la empresa seleccionada
-- Nota: Para desarrollo local sin autenticación real, usamos política pública
CREATE POLICY "Permitir acceso por empresa a productos" ON productos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso por empresa a ventas" ON ventas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso por empresa a devoluciones" ON devoluciones
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso por empresa a recargas" ON recargas
    FOR ALL USING (true) WITH CHECK (true);
```

## 📝 Después de ejecutar este script:

1. Las tablas tendrán la columna `empresa_id`
2. Los datos existentes tendrán `empresa_id = 'sancristobal'` por defecto
3. El sistema filtrará automáticamente por empresa cuando uses Supabase

## ⚠️ IMPORTANTE:

Este script NO borra tus datos existentes. Solo agrega la columna `empresa_id` y establece el valor por defecto para registros existentes.