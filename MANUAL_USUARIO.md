# Manual de Usuario – Plataforma Informes

## 1. Uso General

**Acceso:**
- Ingresar a la plataforma mediante la URL proporcionada.
- Iniciar sesión con usuario y contraseña.

**Navegación Principal:**
- Dashboard: Vista general de reportes y estado.
- Reportes: Listado de reportes generados, opción para ver, descargar PDF o crear nuevo.
- Perfil: Modificar datos personales y contraseña.
- Administración (solo usuarios autorizados): Gestión de usuarios, tipos de máquinas y componentes.

---

## 2. Funcionalidades Principales

### a) Crear un nuevo reporte

1. Ir a la sección "Nuevo Reporte".
2. Completar los datos generales de la máquina (cliente, tipo, modelo, serie, horómetro, etc).
3. Agregar componentes inspeccionados, hallazgos y parámetros.
4. Subir fotos de los componentes (se almacenan en Supabase).
5. Agregar sugerencias y conclusiones.
6. Guardar el reporte.

### b) Visualizar y descargar reportes

- En la sección "Reportes", seleccionar un reporte para ver el detalle.
- Descargar el reporte en formato PDF (generado automáticamente).

### c) Administración de usuarios y tipos

- Los administradores pueden crear, editar o eliminar usuarios.
- Gestionar tipos de máquinas y componentes desde el panel de administración.

### d) Perfil de usuario

- Cambiar contraseña y actualizar información personal.

---

## 3. Consideraciones

- Las imágenes subidas se almacenan de forma segura en Supabase.
- Los reportes y datos se guardan en la base de datos Neon.
- El acceso a funcionalidades depende del rol del usuario (usuario normal o administrador). 