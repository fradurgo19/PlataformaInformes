# Checklist de Pruebas en Producción

## 1. Acceso y Autenticación
- [ ] La página de login carga correctamente.
- [ ] El login funciona con credenciales válidas.
- [ ] El login rechaza credenciales inválidas.
- [ ] El registro de nuevos usuarios funciona (si aplica).
- [ ] El cierre de sesión funciona correctamente.
- [ ] El sistema de recuperación de contraseña funciona (si aplica).

## 2. Navegación General
- [ ] El menú de navegación muestra todas las secciones esperadas.
- [ ] Los enlaces del menú llevan a la página correcta.
- [ ] El logo y los elementos de branding se ven bien.

## 3. Dashboard / Página Principal
- [ ] Se muestran los datos principales (resúmenes, gráficos, etc.).
- [ ] Los datos se actualizan correctamente al recargar la página.

## 4. Gestión de Reportes
- [ ] Se listan los reportes existentes.
- [ ] Se puede ver el detalle de un reporte.
- [ ] Se puede crear un nuevo reporte.
- [ ] Se pueden subir archivos/fotos en el reporte (si aplica).
- [ ] Se pueden editar reportes existentes.
- [ ] Se pueden eliminar reportes.
- [ ] Se pueden descargar reportes en PDF (si aplica).

## 5. Gestión de Usuarios (si aplica)
- [ ] Se listan los usuarios correctamente.
- [ ] Se pueden crear nuevos usuarios.
- [ ] Se pueden editar usuarios existentes.
- [ ] Se pueden eliminar usuarios.
- [ ] Se pueden asignar roles/permisos.

## 6. Gestión de Tipos de Máquina/Componente (si aplica)
- [ ] Se listan los tipos correctamente.
- [ ] Se pueden crear, editar y eliminar tipos.

## 7. Perfil de Usuario
- [ ] Se muestra la información del usuario logueado.
- [ ] Se puede editar la información personal.
- [ ] Se puede cambiar la contraseña.

## 8. Alertas y Notificaciones
- [ ] Se muestran mensajes de éxito/error al realizar acciones.
- [ ] Se reciben notificaciones por email (si aplica).

## 9. Validaciones y Errores
- [ ] Los formularios muestran mensajes de error si faltan datos o hay errores.
- [ ] No hay errores en la consola del navegador.
- [ ] No hay errores 404/500 en la red.

## 10. Rendimiento y Responsividad
- [ ] La app carga rápido.
- [ ] Se ve bien en dispositivos móviles y escritorio.
- [ ] No hay problemas de diseño (desbordes, textos cortados, etc.).

## 11. Seguridad
- [ ] No se puede acceder a páginas protegidas sin login.
- [ ] Los datos sensibles no se muestran a usuarios no autorizados.
- [ ] Los archivos subidos no permiten ejecutar código malicioso.

## 12. Pruebas de Roles (si aplica)
- [ ] Los usuarios con diferentes roles ven solo lo que les corresponde.
- [ ] Los administradores pueden acceder a todas las funciones. 