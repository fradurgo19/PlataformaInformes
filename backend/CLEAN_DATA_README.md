# 🧹 Scripts de Limpieza de Datos

Este directorio contiene scripts para limpiar datos de pruebas de la plataforma de informes.

## 📋 Scripts Disponibles

### 1. `clean-test-data.js` - Script Interactivo
Script completo con confirmaciones y opciones para desarrollo.

**Uso:**
```bash
# Mostrar estadísticas actuales
node clean-test-data.js --stats

# Mostrar ayuda
node clean-test-data.js --help

# Ejecutar con confirmación (desarrollo)
node clean-test-data.js

# Ejecutar sin confirmación (forzar)
node clean-test-data.js --force
```

### 2. `clean-production-data.js` - Script de Producción
Script simplificado para ejecutar directamente en producción.

**Uso:**
```bash
node clean-production-data.js
```

## 🗂️ Qué se Elimina

### ✅ Datos que se ELIMINAN:
- **Reportes**: Todos los informes de maquinaria
- **Componentes**: Todos los componentes de los reportes
- **Fotos**: Todas las imágenes (de Supabase Storage y base de datos)
- **Partes Sugeridas**: Todas las partes recomendadas

### 🔒 Datos que se MANTIENEN:
- **Usuarios**: Todos los usuarios (incluyendo admin)
- **Tipos de Máquina**: Configuración de tipos de maquinaria
- **Tipos de Componente**: Configuración de tipos de componentes
- **Recursos**: Documentos y recursos técnicos
- **Parámetros**: Parámetros técnicos de las máquinas

## 🚀 Ejecución en Producción

### Opción 1: Usando Railway CLI
```bash
# Conectar a Railway
railway login

# Ejecutar script en producción
railway run node clean-production-data.js
```

### Opción 2: Usando Vercel CLI
```bash
# Conectar a Vercel
vercel login

# Ejecutar script en producción
vercel exec node clean-production-data.js
```

### Opción 3: Desde el Dashboard de Railway
1. Ir al dashboard de Railway
2. Seleccionar tu proyecto
3. Ir a la pestaña "Deployments"
4. Hacer clic en "Deploy" con el comando: `node clean-production-data.js`

## ⚙️ Variables de Entorno Requeridas

Asegúrate de que estas variables estén configuradas:

### Para Neon (PostgreSQL):
```env
DB_HOST=your-neon-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
```

### Para Supabase Storage:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=machinery-reports
```

## 🔍 Verificación

Después de ejecutar la limpieza, puedes verificar que funcionó correctamente:

1. **Verificar en la aplicación web**: Los reportes ya no aparecerán
2. **Verificar en Supabase Storage**: Las fotos ya no estarán en el bucket
3. **Verificar en Neon**: Las tablas de reportes estarán vacías

## ⚠️ Advertencias Importantes

1. **IRREVERSIBLE**: Esta operación no se puede deshacer
2. **RESPALDO**: Considera hacer un respaldo antes de ejecutar
3. **PRODUCCIÓN**: Solo ejecuta en producción cuando estés seguro
4. **USUARIOS**: Los usuarios y configuraciones se mantienen intactos

## 🛠️ Solución de Problemas

### Error de conexión a Neon:
```bash
# Verificar variables de entorno
echo $DB_HOST
echo $DB_PASSWORD

# Probar conexión
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
```

### Error de conexión a Supabase:
```bash
# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Error de permisos:
- Asegúrate de que el usuario de la base de datos tenga permisos DELETE
- Verifica que la service role key de Supabase tenga permisos de storage

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de error
2. Verifica las variables de entorno
3. Confirma que tienes acceso a Neon y Supabase
4. Contacta al equipo de desarrollo si es necesario 