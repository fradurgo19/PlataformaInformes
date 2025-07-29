const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Neon (PostgreSQL)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
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

async function cleanProductionData() {
  try {
    console.log('🧹 Limpiando datos de producción...');
    
    // 1. Obtener todos los report IDs
    const reportsResult = await pool.query('SELECT id FROM reports');
    const reportIds = reportsResult.rows.map(row => row.id);
    
    if (reportIds.length === 0) {
      console.log('ℹ️ No hay reportes para eliminar');
      return;
    }
    
    console.log(`📋 Eliminando ${reportIds.length} reportes...`);
    
    // 2. Obtener component IDs
    const componentsResult = await pool.query('SELECT id FROM components WHERE report_id = ANY($1)', [reportIds]);
    const componentIds = componentsResult.rows.map(row => row.id);
    
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
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanProductionData(); 