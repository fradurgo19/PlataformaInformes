const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Neon (PostgreSQL)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'machinery_reports',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bucket = process.env.SUPABASE_BUCKET || 'machinery-reports';

async function cleanTestData() {
  try {
    console.log('🧹 Iniciando limpieza de datos de pruebas...');
    
    // 1. Limpiar datos de Neon (PostgreSQL)
    console.log('📊 Limpiando datos de Neon...');
    
    // Obtener todos los report IDs antes de borrar
    const reportsResult = await pool.query('SELECT id FROM reports');
    const reportIds = reportsResult.rows.map(row => row.id);
    
    if (reportIds.length > 0) {
      console.log(`📋 Encontrados ${reportIds.length} reportes para eliminar`);
      
      // Obtener todos los component IDs para las fotos
      const componentsResult = await pool.query('SELECT id FROM components WHERE report_id = ANY($1)', [reportIds]);
      const componentIds = componentsResult.rows.map(row => row.id);
      
      if (componentIds.length > 0) {
        console.log(`🔧 Encontrados ${componentIds.length} componentes para eliminar`);
        
        // Obtener nombres de archivos de fotos antes de borrar
        const photosResult = await pool.query('SELECT filename FROM photos WHERE component_id = ANY($1)', [componentIds]);
        const photoFilenames = photosResult.rows.map(row => row.filename);
        
        if (photoFilenames.length > 0) {
          console.log(`📸 Encontradas ${photoFilenames.length} fotos para eliminar de Supabase Storage`);
          
          // 2. Limpiar archivos de Supabase Storage
          console.log('☁️ Limpiando archivos de Supabase Storage...');
          
          for (const filename of photoFilenames) {
            try {
              const { error } = await supabase.storage
                .from(bucket)
                .remove([filename]);
              
              if (error) {
                console.warn(`⚠️ Error eliminando archivo ${filename}:`, error.message);
              } else {
                console.log(`✅ Eliminado archivo: ${filename}`);
              }
            } catch (error) {
              console.warn(`⚠️ Error eliminando archivo ${filename}:`, error.message);
            }
          }
        }
        
        // Borrar fotos de la base de datos
        await pool.query('DELETE FROM photos WHERE component_id = ANY($1)', [componentIds]);
        console.log('✅ Fotos eliminadas de la base de datos');
      }
      
      // Borrar componentes
      await pool.query('DELETE FROM components WHERE report_id = ANY($1)', [reportIds]);
      console.log('✅ Componentes eliminados');
      
      // Borrar partes sugeridas
      await pool.query('DELETE FROM suggested_parts WHERE report_id = ANY($1)', [reportIds]);
      console.log('✅ Partes sugeridas eliminadas');
      
      // Borrar reportes
      await pool.query('DELETE FROM reports WHERE id = ANY($1)', [reportIds]);
      console.log('✅ Reportes eliminados');
      
    } else {
      console.log('ℹ️ No se encontraron reportes para eliminar');
    }
    
    // 3. Verificar que se mantengan los datos de configuración
    console.log('🔍 Verificando datos de configuración...');
    
    const adminUser = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin']);
    const machineTypes = await pool.query('SELECT COUNT(*) FROM machine_types');
    const componentTypes = await pool.query('SELECT COUNT(*) FROM component_types');
    const resources = await pool.query('SELECT COUNT(*) FROM resources');
    const parameters = await pool.query('SELECT COUNT(*) FROM parameters');
    
    console.log('📊 Estado de datos de configuración:');
    console.log(`   👤 Usuario admin: ${adminUser.rows[0].count}`);
    console.log(`   🚜 Tipos de máquina: ${machineTypes.rows[0].count}`);
    console.log(`   🔧 Tipos de componente: ${componentTypes.rows[0].count}`);
    console.log(`   📚 Recursos: ${resources.rows[0].count}`);
    console.log(`   ⚙️ Parámetros: ${parameters.rows[0].count}`);
    
    console.log('🎉 Limpieza de datos de pruebas completada exitosamente!');
    console.log('💡 Los datos de configuración (usuarios, tipos, recursos, parámetros) se mantuvieron intactos.');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await pool.end();
  }
}

// Función para mostrar estadísticas antes de limpiar
async function showStatistics() {
  try {
    console.log('📊 Estadísticas actuales de la base de datos:');
    
    const reports = await pool.query('SELECT COUNT(*) FROM reports');
    const components = await pool.query('SELECT COUNT(*) FROM components');
    const photos = await pool.query('SELECT COUNT(*) FROM photos');
    const suggestedParts = await pool.query('SELECT COUNT(*) FROM suggested_parts');
    const users = await pool.query('SELECT COUNT(*) FROM users');
    
    console.log(`   📋 Reportes: ${reports.rows[0].count}`);
    console.log(`   🔧 Componentes: ${components.rows[0].count}`);
    console.log(`   📸 Fotos: ${photos.rows[0].count}`);
    console.log(`   🔩 Partes sugeridas: ${suggestedParts.rows[0].count}`);
    console.log(`   👥 Usuarios: ${users.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--stats') || args.includes('-s')) {
    await showStatistics();
    await pool.end();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🧹 Script de limpieza de datos de pruebas');
    console.log('');
    console.log('Uso:');
    console.log('  node clean-test-data.js          # Ejecutar limpieza completa');
    console.log('  node clean-test-data.js --stats  # Mostrar estadísticas actuales');
    console.log('  node clean-test-data.js --help   # Mostrar esta ayuda');
    console.log('');
    console.log('Este script eliminará:');
    console.log('  ✅ Todos los reportes de prueba');
    console.log('  ✅ Todos los componentes de prueba');
    console.log('  ✅ Todas las fotos de prueba (de Supabase Storage y BD)');
    console.log('  ✅ Todas las partes sugeridas de prueba');
    console.log('');
    console.log('Mantendrá:');
    console.log('  🔒 Usuarios (incluyendo admin)');
    console.log('  🚜 Tipos de máquina');
    console.log('  🔧 Tipos de componente');
    console.log('  📚 Recursos');
    console.log('  ⚙️ Parámetros');
    return;
  }
  
  // Confirmación antes de ejecutar
  console.log('⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de pruebas.');
  console.log('📋 Esto incluye reportes, componentes, fotos y partes sugeridas.');
  console.log('🔒 Los datos de configuración (usuarios, tipos, recursos) se mantendrán.');
  console.log('');
  
  // En producción, ejecutar directamente
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Ejecutando en modo producción...');
    await cleanTestData();
    return;
  }
  
  // En desarrollo, mostrar estadísticas y preguntar
  await showStatistics();
  console.log('');
  console.log('¿Deseas continuar con la limpieza? (y/N)');
  
  // Para automatización, usar --force
  if (args.includes('--force') || args.includes('-f')) {
    console.log('🚀 Ejecutando con --force...');
    await cleanTestData();
    return;
  }
  
  // En modo interactivo, esperar confirmación
  process.stdin.once('data', async (data) => {
    const input = data.toString().trim().toLowerCase();
    if (input === 'y' || input === 'yes') {
      await cleanTestData();
    } else {
      console.log('❌ Operación cancelada');
    }
    process.exit(0);
  });
}

main().catch(console.error); 