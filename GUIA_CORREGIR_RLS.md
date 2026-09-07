# 🔧 Script para corregir políticas RLS

Este script corrige las políticas para permitir INSERT, UPDATE y DELETE en todas las tablas.

```sql
-- Eliminar todas las políticas existentes y crear nuevas que permiten todo
DROP POLICY IF EXISTS "Permitir acceso por empresa a productos" ON productos;
DROP POLICY IF EXISTS "Permitir acceso por empresa a ventas" ON ventas;
DROP POLICY IF EXISTS "Permitir acceso por empresa a devoluciones" ON devoluciones;
DROP POLICY IF EXISTS "Permitir acceso por empresa a recargas" ON recargas;

-- Crear políticas que permiten SELECT, INSERT, UPDATE y DELETE
CREATE POLICY "Permitir todo en productos" ON productos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en ventas" ON ventas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en devoluciones" ON devoluciones
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en recargas" ON recargas
    FOR ALL USING (true) WITH CHECK (true);
```

Copia y pega este script en el SQL Editor de Supabase y haz clic en "Run".