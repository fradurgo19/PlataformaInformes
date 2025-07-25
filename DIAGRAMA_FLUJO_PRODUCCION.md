# Diagrama de Flujo – Arquitectura en Producción

```mermaid
flowchart TD
    A[Usuario]
    B[Frontend React (Vercel)]
    C[Backend API REST (Vercel)]
    D[NeonDB (PostgreSQL)]
    E[Supabase Storage]
    F[PDF Service (en backend)]

    A -->|Accede vía navegador| B
    B -->|Solicita datos, login, reportes| C
    C -->|Lee/Escribe| D
    C -->|Sube/Descarga imágenes| E
    B -->|Descarga imágenes| E
    C -->|Genera PDF| F
    B -->|Descarga PDF| F

    subgraph Vercel
      B
      C
      F
    end
    subgraph Externos
      D
      E
    end
```

**Descripción:**
- El usuario accede al frontend en Vercel.
- El frontend se comunica con el backend (también en Vercel) para autenticación, reportes, etc.
- El backend consulta y actualiza datos en NeonDB (PostgreSQL).
- El backend sube y descarga imágenes desde Supabase Storage; el frontend puede descargar imágenes directamente.
- El backend genera PDFs y el frontend los descarga.
- Todo el frontend, backend y generación de PDFs está desplegado en Vercel; la base de datos y el almacenamiento de imágenes están en servicios externos (Neon y Supabase). 