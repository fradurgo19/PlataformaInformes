# ✅ Checklist de Funcionalidades - Plataforma de Informes

## 🔐 **AUTENTICACIÓN**

### ✅ Login
- [ ] Login con usuario existente
- [ ] Login con credenciales incorrectas (debe mostrar error)
- [ ] Login con campos vacíos (debe mostrar error)
- [ ] Verificar que el token se guarda correctamente

### ✅ Registro
- [ ] Registro de nuevo usuario con rol 'user'
- [ ] Registro de nuevo usuario con rol 'viewer'
- [ ] Registro con email duplicado (debe mostrar error)
- [ ] Registro con username duplicado (debe mostrar error)
- [ ] Registro con campos vacíos (debe mostrar error)

### ✅ Perfil de Usuario
- [ ] Ver perfil del usuario logueado
- [ ] Actualizar información del perfil
- [ ] Cambiar contraseña
- [ ] Validar que no se puede usar email de otro usuario

## 📊 **GESTIÓN DE REPORTES**

### ✅ Crear Reporte
- [ ] Crear reporte con información básica
- [ ] Agregar componentes al reporte
- [ ] Agregar parámetros a los componentes
- [ ] Subir fotos al reporte
- [ ] Validar campos obligatorios
- [ ] Verificar que se guarda correctamente en la base de datos

### ✅ Ver Reportes
- [ ] Listar todos los reportes (admin/user)
- [ ] Ver solo reportes propios (viewer)
- [ ] Filtrar reportes por estado
- [ ] Filtrar reportes por prioridad
- [ ] Buscar reportes por título
- [ ] Buscar reportes por serial de máquina
- [ ] Buscar reportes por creador

### ✅ Editar Reporte
- [ ] Editar información básica del reporte
- [ ] Agregar/quitar componentes
- [ ] Modificar parámetros de componentes
- [ ] Agregar/quitar fotos
- [ ] Cambiar estado del reporte
- [ ] Cambiar prioridad del reporte

### ✅ Ver Reporte Individual
- [ ] Ver detalles completos del reporte
- [ ] Ver componentes con parámetros
- [ ] Ver fotos del reporte
- [ ] Ver información del creador

### ✅ Generar PDF
- [ ] Descargar PDF del reporte
- [ ] Verificar que el PDF se genera correctamente
- [ ] Verificar que incluye todos los datos
- [ ] Verificar formato bilingüe

## 👥 **GESTIÓN DE USUARIOS (Solo Admin)**

### ✅ Ver Usuarios
- [ ] Listar todos los usuarios
- [ ] Ver información de cada usuario
- [ ] Verificar que solo admins pueden acceder

### ✅ Editar Usuarios
- [ ] Editar información de usuario
- [ ] Cambiar rol de usuario
- [ ] Cambiar contraseña de usuario
- [ ] Validar permisos de admin

### ✅ Eliminar Usuarios
- [ ] Eliminar usuario (solo admin)
- [ ] Verificar que no se puede eliminar el propio usuario
- [ ] Verificar que el usuario se elimina correctamente

## 🏭 **TIPOS DE MÁQUINAS Y COMPONENTES**

### ✅ Tipos de Máquinas
- [ ] Ver lista de tipos de máquinas
- [ ] Verificar que están en español e inglés
- [ ] Verificar que se cargan correctamente

### ✅ Tipos de Componentes
- [ ] Ver lista de tipos de componentes
- [ ] Ver parámetros de cada componente
- [ ] Verificar que están en español e inglés
- [ ] Verificar que se cargan correctamente

## 📱 **INTERFAZ DE USUARIO**

### ✅ Navegación
- [ ] Navegar entre todas las páginas
- [ ] Verificar que el menú funciona correctamente
- [ ] Verificar que los enlaces funcionan
- [ ] Verificar responsive design

### ✅ Formularios
- [ ] Validación de formularios
- [ ] Mensajes de error apropiados
- [ ] Mensajes de éxito apropiados
- [ ] Loading states

### ✅ Filtros y Búsqueda
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda funciona correctamente
- [ ] Paginación funciona correctamente

## 🔒 **SEGURIDAD Y PERMISOS**

### ✅ Roles y Permisos
- [ ] Admin puede ver todos los reportes
- [ ] User puede ver todos los reportes
- [ ] Viewer solo ve sus propios reportes
- [ ] Solo admin puede gestionar usuarios
- [ ] Verificar que no se puede acceder sin autenticación

### ✅ Rate Limiting
- [ ] Verificar que funciona en desarrollo
- [ ] Verificar que no bloquea uso normal
- [ ] Verificar logs de rate limiting

## 📊 **MONITOREO Y LOGS**

### ✅ Logs de Auditoría
- [ ] Verificar que se generan logs de login
- [ ] Verificar que se generan logs de creación de reportes
- [ ] Verificar que se generan logs de edición
- [ ] Verificar que se generan logs de descarga de PDF

### ✅ Métricas
- [ ] Acceder a `/metrics` (debe funcionar)
- [ ] Verificar que se recopilan métricas
- [ ] Verificar información de rendimiento

### ✅ Alertas
- [ ] Verificar sistema de alertas (solo admin)
- [ ] Verificar endpoints de alertas

## 🧪 **TESTING**

### ✅ Tests Unitarios
- [ ] Ejecutar tests unitarios
- [ ] Verificar que todos pasan

### ✅ Tests de Integración
- [ ] Ejecutar tests de integración
- [ ] Verificar que todos pasan

### ✅ Tests de API
- [ ] Ejecutar tests de API
- [ ] Verificar que todos pasan

## 📁 **ARCHIVOS Y UPLOADS**

### ✅ Subida de Archivos
- [ ] Subir fotos válidas (JPG, PNG, etc.)
- [ ] Intentar subir archivos inválidos (debe rechazar)
- [ ] Intentar subir archivos muy grandes (debe rechazar)
- [ ] Verificar que las fotos se muestran correctamente

### ✅ Validación de Archivos
- [ ] Verificar validación de tipos MIME
- [ ] Verificar validación de tamaño
- [ ] Verificar sanitización de nombres

## 🌐 **CORS Y CONECTIVIDAD**

### ✅ CORS
- [ ] Verificar que el frontend puede comunicarse con el backend
- [ ] Verificar que no hay errores de CORS
- [ ] Verificar que las peticiones funcionan correctamente

## 📝 **NOTAS IMPORTANTES**

- **Desarrollo:** Rate limiting más permisivo, bypass de roles
- **Producción:** Rate limiting estricto, validación completa de roles
- **Logs:** Se guardan en `backend/logs/`
- **Métricas:** Disponibles en `/metrics`
- **Alertas:** Solo para admins en `/api/alerts`

## 🚨 **PROBLEMAS COMUNES A VERIFICAR**

- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor
- [ ] Las peticiones HTTP tienen códigos de estado correctos
- [ ] Los datos se guardan correctamente en la base de datos
- [ ] Los archivos se suben correctamente
- [ ] Los PDFs se generan correctamente 