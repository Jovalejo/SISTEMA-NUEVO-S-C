# Guía para cambiar columna 'cliente' a 'vendedor' en Supabase

## Problema
La tabla `ventas` en Supabase tiene la columna `cliente` pero el código ahora usa `vendedor`.

## Solución
Ejecuta este script SQL en el SQL Editor de Supabase:

```sql
-- Cambiar nombre de columna cliente a vendedor en la tabla ventas
ALTER TABLE ventas RENAME COLUMN cliente TO vendedor;
```

## Pasos para ejecutar:

1. Ve a tu proyecto en Supabase
2. Entra al **SQL Editor** (icono de terminal en el menú izquierdo)
3. Crea una **New Query**
4. Copia y pega el script SQL de arriba
5. Haz clic en **Run** o presiona Ctrl+Enter
6. Verifica que se ejecutó sin errores

## Nota
Este cambio es seguro porque:
- Solo cambia el nombre de la columna
- Preserva todos los datos existentes
- No afecta las relaciones ni constraints
- Es reversible si es necesario

## Si necesitas revertir:
```sql
-- Revertir el cambio (si es necesario)
ALTER TABLE ventas RENAME COLUMN vendedor TO cliente;
```
