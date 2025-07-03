const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'maquinaria_reports',
  user: process.env.DB_USER || 'maquinaria_user',
  password: process.env.DB_PASSWORD || 'maquinaria_password',
});

async function seedData() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Get admin user ID
    const adminResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found. Run init-db.js first.');
      return;
    }
    
    const adminId = adminResult.rows[0].id;
    console.log('✅ Found admin user:', adminId);
    
    // Bulk insert machine types
    const machineTypes = [
      { name: 'Excavator', description: 'Excavation machinery' },
      { name: 'Bulldozer', description: 'Earth-moving machinery' },
      { name: 'Loader', description: 'Material loading machinery' },
      { name: 'Breaker', description: 'Demolition machinery' },
      { name: 'Crane', description: 'Lifting machinery' },
      { name: 'Compactor', description: 'Soil and asphalt compaction machinery' },
      { name: 'Grader', description: 'Surface leveling machinery' },
    ];
    for (const mt of machineTypes) {
      await pool.query(
        `INSERT INTO machine_types (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [mt.name, mt.description]
      );
    }
    
    // Bulk insert component types
    const componentTypes = [
      { name: 'Accumulator Hammer', description: 'Accumulator for hammer system' },
      { name: 'Hammer Head', description: 'Head of the hammer' },
      { name: 'Cabin', description: 'Operator cabin' },
      { name: 'Chassis', description: 'Main chassis structure' },
      { name: 'Hammer Main Body', description: 'Main body of the hammer' },
      { name: 'Steering', description: 'Steering system' },
      { name: 'Front Axle', description: 'Front axle assembly' },
      { name: 'Rear Axle', description: 'Rear axle assembly' },
      { name: 'GET', description: 'Ground Engaging Tools' },
      { name: 'Swing', description: 'Swing mechanism' },
      { name: 'Engine', description: 'Engine system' },
      { name: 'Electrical System', description: 'Electrical system' },
      { name: 'Hydraulic System', description: 'Hydraulic system' },
      { name: 'Transmission', description: 'Transmission system' },
      { name: 'Travel', description: 'Travel/propulsion system' },
      { name: 'Undercarriage', description: 'Undercarriage assembly' },
    ];
    for (const ct of componentTypes) {
      await pool.query(
        `INSERT INTO component_types (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [ct.name, ct.description]
      );
    }
    
    // Check if reports already exist
    const existingReports = await pool.query('SELECT COUNT(*) FROM reports');
    if (parseInt(existingReports.rows[0].count) > 0) {
      console.log('⚠️ Reports already exist. Skipping seed data.');
      return;
    }
    
    // Create sample reports
    const reports = [
      {
        client_name: 'Constructora ABC',
        machine_type: 'EXCAVATOR',
        model: 'CAT 320',
        serial_number: 'CAT123456789',
        hourmeter: 2500,
        report_date: '2024-06-15',
        ott: 'OTT-001-2024',
        conclusions: 'Máquina en buen estado general',
        overall_suggestions: 'Realizar mantenimiento preventivo en 500 horas',
        status: 'completed'
      },
      {
        client_name: 'Minería XYZ',
        machine_type: 'WHEEL_LOADER',
        model: 'CAT 950',
        serial_number: 'CAT987654321',
        hourmeter: 1800,
        report_date: '2024-06-20',
        ott: 'OTT-002-2024',
        conclusions: 'Se requiere atención en el sistema hidráulico',
        overall_suggestions: 'Cambiar filtros hidráulicos y revisar bombas',
        status: 'draft'
      },
      {
        client_name: 'Obras Públicas',
        machine_type: 'MOTOR_GRADER',
        model: 'CAT 140',
        serial_number: 'CAT456789123',
        hourmeter: 3200,
        report_date: '2024-06-25',
        ott: 'OTT-003-2024',
        conclusions: 'Máquina operativa con algunas observaciones menores',
        overall_suggestions: 'Ajustar frenos y revisar sistema de dirección',
        status: 'completed'
      }
    ];
    
    console.log('📝 Creating sample reports...');
    
    for (const reportData of reports) {
      const reportResult = await pool.query(
        `INSERT INTO reports (
          user_id, client_name, machine_type, model, serial_number, 
          hourmeter, report_date, ott, conclusions, overall_suggestions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id`,
        [
          adminId,
          reportData.client_name,
          reportData.machine_type,
          reportData.model,
          reportData.serial_number,
          reportData.hourmeter,
          reportData.report_date,
          reportData.ott,
          reportData.conclusions,
          reportData.overall_suggestions,
          reportData.status
        ]
      );
      
      const reportId = reportResult.rows[0].id;
      console.log(`✅ Created report: ${reportData.client_name} (${reportId})`);
      
      // Create sample components for each report
      const components = [
        {
          type: 'ENGINE',
          findings: 'Motor funcionando correctamente',
          parameters: 'Temperatura: 85°C, Presión de aceite: Normal',
          status: 'CORRECTED',
          suggestions: 'Mantener programa de mantenimiento',
          priority: 'LOW'
        },
        {
          type: 'HYDRAULIC_PUMP',
          findings: 'Bomba hidráulica operativa',
          parameters: 'Presión: 200 bar, Flujo: Normal',
          status: 'PENDING',
          suggestions: 'Revisar en próximo mantenimiento',
          priority: 'MEDIUM'
        }
      ];
      
      for (const componentData of components) {
        await pool.query(
          `INSERT INTO components (
            report_id, type, findings, parameters, status, suggestions, priority
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            reportId,
            componentData.type,
            componentData.findings,
            componentData.parameters,
            componentData.status,
            componentData.suggestions,
            componentData.priority
          ]
        );
      }
      
      // Create sample suggested parts
      const parts = [
        {
          part_number: 'FIL-001',
          description: 'Filtro de aceite motor',
          quantity: 1
        },
        {
          part_number: 'FIL-002',
          description: 'Filtro hidráulico',
          quantity: 2
        }
      ];
      
      for (const partData of parts) {
        await pool.query(
          `INSERT INTO suggested_parts (
            report_id, part_number, description, quantity
          ) VALUES ($1, $2, $3, $4)`,
          [reportId, partData.part_number, partData.description, partData.quantity]
        );
      }
    }
    
    console.log('🎉 Sample data created successfully!');
    console.log('📊 Created 3 reports with components and suggested parts');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

seedData(); 