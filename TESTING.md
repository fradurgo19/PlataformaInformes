# 🧪 Guía de Testing - Plataforma de Informes de Maquinaria

## 📋 Checklist de Funcionalidades

### ✅ Autenticación
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Registro de nuevos usuarios
- [ ] Logout
- [ ] Protección de rutas

### ✅ Gestión de Reportes
- [ ] Crear nuevo reporte
- [ ] Editar reporte existente
- [ ] Ver lista de reportes
- [ ] Filtrar reportes por usuario
- [ ] Descargar PDF
- [ ] Enviar reporte por email

### ✅ Gestión de Usuarios
- [ ] Crear usuario admin
- [ ] Crear usuario regular
- [ ] Crear usuario viewer
- [ ] Ver lista de usuarios (solo admin)
- [ ] Editar usuarios (solo admin)

### ✅ Funcionalidades por Rol
- [ ] Admin: Acceso completo
- [ ] User: Ver todos los reportes
- [ ] Viewer: Solo ver sus reportes

### ✅ PDF Generation
- [ ] Generar PDF con imágenes
- [ ] PDF bilingüe
- [ ] Tabla de parámetros
- [ ] Fotos de componentes

## 🔧 Testing Manual

### 1. Testing de Autenticación
```bash
# Probar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Testing de API
```bash
# Obtener reportes
curl -X GET http://localhost:3001/api/reports \
  -H "Authorization: Bearer TU_TOKEN"
```

### 3. Testing de Frontend
- Abrir DevTools
- Verificar Network tab
- Verificar Console para errores
- Probar en diferentes navegadores

## 🐛 Problemas Comunes

### Error de CORS
- Verificar configuración en backend
- Asegurar que CORS_ORIGIN coincida

### Error de Base de Datos
- Verificar conexión PostgreSQL
- Ejecutar `node reset-db.js`

### Error de JWT
- Verificar JWT_SECRET
- Limpiar localStorage

### Error de Upload
- Verificar carpeta uploads
- Verificar permisos de escritura

## 📊 Métricas de Rendimiento

### Backend
- Tiempo de respuesta API
- Uso de memoria
- CPU usage

### Frontend
- Tiempo de carga de páginas
- Tamaño de bundle
- Lighthouse score

## 🔍 Debugging

### Backend Logs
```bash
# Ver logs en tiempo real
pm2 logs machinery-backend

# Ver logs específicos
pm2 logs machinery-backend --lines 100
```

### Frontend Debugging
```javascript
// En el navegador
localStorage.clear()
sessionStorage.clear()
```

## 🚀 Testing de Producción

### Checklist Pre-Producción
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL/HTTPS configurado
- [ ] CORS configurado correctamente
- [ ] Logs configurados
- [ ] Backup automático configurado

### Testing Post-Despliegue
- [ ] Login funciona
- [ ] Crear reporte funciona
- [ ] PDF se genera correctamente
- [ ] Email se envía
- [ ] Filtros funcionan
- [ ] Roles funcionan correctamente 