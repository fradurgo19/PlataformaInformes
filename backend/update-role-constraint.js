const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'maquinaria_reports',
  user: process.env.DB_USER || 'maquinaria_user',
  password: process.env.DB_PASSWORD || 'maquinaria_password',
});

async function updateRoleConstraint() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Drop the existing constraint
    console.log('🗑️ Dropping existing role constraint...');
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    
    // Add the new constraint with viewer role
    console.log('➕ Adding new role constraint with viewer...');
    await pool.query('ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'admin\', \'user\', \'viewer\'))');
    
    console.log('✅ Role constraint updated successfully!');
    console.log('📋 Now supports: admin, user, viewer');
    
  } catch (error) {
    console.error('❌ Error updating role constraint:', error);
  } finally {
    await pool.end();
  }
}

updateRoleConstraint(); 