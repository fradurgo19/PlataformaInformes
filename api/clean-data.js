const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Neon (PostgreSQL)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bucket = process.env.SUPABASE_BUCKET || 'machinery-reports';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar token de seguridad (opcional)
  const authToken = req.headers.authorization;
  if (!authToken || authToken !== `Bearer ${process.env.CLEAN_DATA_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🧹 Iniciando limpieza de datos de producción...');
    
    // 1. Obtener todos los report IDs
    const reportsResult = await pool.query('SELECT id FROM reports');
    const reportIds = reportsResult.rows.map(row => row.id);
    
    if (reportIds.length === 0) {
      console.log('ℹ️ No hay reportes para eliminar');
      return res.status(200).json({ 
        message: 'No hay reportes para eliminar',
        deleted: {
          reports: 0,
          components: 0,
          photos: 0,
          files: 0
        }
      });
    }
    
    console.log(`📋 Eliminando ${reportIds.length} reportes...`);
    
    // 2. Obtener component IDs
    const componentsResult = await pool.query('SELECT id FROM components WHERE report_id = ANY($1)', [reportIds]);
    const componentIds = componentsResult.rows.map(row => row.id);
    
    let deletedFiles = 0;
    
    if (componentIds.length > 0) {
      // 3. Obtener nombres de archivos de fotos
      const photosResult = await pool.query('SELECT filename FROM photos WHERE component_id = ANY($1)', [componentIds]);
      const photoFilenames = photosResult.rows.map(row => row.filename);
      
      // 4. Eliminar archivos de Supabase Storage
      if (photoFilenames.length > 0) {
        console.log(`📸 Eliminando ${photoFilenames.length} archivos de Supabase Storage...`);
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove(photoFilenames);
        
        if (error) {
          console.warn('⚠️ Error eliminando archivos de Supabase:', error.message);
        } else {
          console.log('✅ Archivos eliminados de Supabase Storage');
          deletedFiles = photoFilenames.length;
        }
      }
      
      // 5. Eliminar fotos de la base de datos
      await pool.query('DELETE FROM photos WHERE component_id = ANY($1)', [componentIds]);
    }
    
    // 6. Eliminar componentes
    await pool.query('DELETE FROM components WHERE report_id = ANY($1)', [reportIds]);
    
    // 7. Eliminar partes sugeridas
    await pool.query('DELETE FROM suggested_parts WHERE report_id = ANY($1)', [reportIds]);
    
    // 8. Eliminar reportes
    await pool.query('DELETE FROM reports WHERE id = ANY($1)', [reportIds]);
    
    console.log('✅ Limpieza completada exitosamente');
    
    return res.status(200).json({
      message: 'Limpieza completada exitosamente',
      deleted: {
        reports: reportIds.length,
        components: componentIds.length,
        photos: componentIds.length > 0 ? (await pool.query('SELECT COUNT(*) FROM photos')).rows[0].count : 0,
        files: deletedFiles
      }
    });
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    return res.status(500).json({ 
      error: 'Error durante la limpieza',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await pool.end();
  }
} 