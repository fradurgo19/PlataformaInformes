const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'maquinaria_reports',
  user: process.env.DB_USER || 'maquinaria_user',
  password: process.env.DB_PASSWORD || 'maquinaria_password',
});

async function initDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Generate correct password hash for admin123
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('🔐 Generated password hash for admin123');
    
    // Check if admin user exists
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (checkUser.rows.length > 0) {
      // Update existing admin user with correct password
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2',
        [passwordHash, 'admin']
      );
      console.log('✅ Updated admin user password');
    } else {
      // Create new admin user
      await pool.query(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin', 'admin@machinery.com', passwordHash, 'Administrator', 'admin']
      );
      console.log('✅ Created admin user');
    }
    
    console.log('🎉 Database initialization completed!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase(); 