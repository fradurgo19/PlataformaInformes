const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function updateUserSchema() {
  try {
    console.log('🔧 Actualizando esquema de usuarios...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-user-columns.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await pool.query(sqlContent);
    
    console.log('✅ Esquema de usuarios actualizado exitosamente');
    
    // Verificar la estructura actualizada
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estructura actualizada de la tabla users:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando esquema:', error);
  } finally {
    await pool.end();
  }
}

updateUserSchema(); 