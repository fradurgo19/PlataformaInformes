import request from 'supertest';
import app from '../../index';
import pool from '../../config/database';
import jwt from 'jsonwebtoken';

describe('Reports API Tests', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Crear usuario normal
    const userData = {
      username: 'test_user_reports',
      email: 'test_reports@example.com',
      password: 'password123',
      full_name: 'Test User Reports',
      role: 'user'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: userData.username,
        password: userData.password
      });

    authToken = loginResponse.body.data.token;

    // Crear admin
    const adminData = {
      username: 'test_admin_reports',
      email: 'test_admin_reports@example.com',
      password: 'password123',
      full_name: 'Test Admin Reports',
      role: 'admin'
    };

    await request(app)
      .post('/api/auth/register')
      .send(adminData);

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminData.username,
        password: adminData.password
      });

    adminToken = adminLoginResponse.body.data.token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await pool.query('DELETE FROM reports WHERE title LIKE $1', ['Test Report%']);
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
    await pool.end();
  });

  describe('GET /api/reports', () => {
    it('should return reports list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/reports');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/reports', () => {
    it('should create a new report successfully', async () => {
      const reportData = {
        title: 'Test Report API',
        description: 'Test description',
        machine_serial: 'TEST123',
        machine_type_id: 1,
        findings: 'Test findings',
        status: 'pending',
        priority: 'medium',
        components: [
          {
            component_type_id: 1,
            description: 'Test component',
            quantity: 1,
            parameters: [
              { name: 'Test Param', value: 'Test Value' }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(reportData.title);
      expect(response.body.data.machine_serial).toBe(reportData.machine_serial);
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Report' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/reports/:id', () => {
    let reportId: number;

    beforeAll(async () => {
      // Crear un reporte para las pruebas
      const reportData = {
        title: 'Test Report for Get',
        description: 'Test description',
        machine_serial: 'TEST456',
        machine_type_id: 1,
        findings: 'Test findings',
        status: 'pending',
        priority: 'medium',
        components: [
          {
            component_type_id: 1,
            description: 'Test component',
            quantity: 1,
            parameters: [
              { name: 'Test Param', value: 'Test Value' }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      reportId = response.body.data.id;
    });

    it('should get report by id', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/reports/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/reports/:id', () => {
    let reportId: number;

    beforeAll(async () => {
      // Crear un reporte para las pruebas
      const reportData = {
        title: 'Test Report for Update',
        description: 'Test description',
        machine_serial: 'TEST789',
        machine_type_id: 1,
        findings: 'Test findings',
        status: 'pending',
        priority: 'medium',
        components: [
          {
            component_type_id: 1,
            description: 'Test component',
            quantity: 1,
            parameters: [
              { name: 'Test Param', value: 'Test Value' }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      reportId = response.body.data.id;
    });

    it('should update report successfully', async () => {
      const updateData = {
        title: 'Updated Test Report',
        description: 'Updated description',
        findings: 'Updated findings',
        status: 'completed',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });
  });

  describe('GET /api/reports/:id/pdf', () => {
    let reportId: number;

    beforeAll(async () => {
      // Crear un reporte para las pruebas
      const reportData = {
        title: 'Test Report for PDF',
        description: 'Test description',
        machine_serial: 'TESTPDF',
        machine_type_id: 1,
        findings: 'Test findings',
        status: 'pending',
        priority: 'medium',
        components: [
          {
            component_type_id: 1,
            description: 'Test component',
            quantity: 1,
            parameters: [
              { name: 'Test Param', value: 'Test Value' }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      reportId = response.body.data.id;
    });

    it('should generate PDF successfully', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should generate PDF without logo for viewer role', async () => {
      // Crear un token para un usuario viewer
      const viewerToken = jwt.sign(
        { id: 'viewer-test-id', username: 'viewer', role: 'viewer' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get(`/api/reports/${reportId}/pdf`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('DELETE /api/reports/:id', () => {
    let reportId: string;

    beforeAll(async () => {
      // Crear un reporte para las pruebas de eliminación
      const reportData = {
        reportData: JSON.stringify({
          client_name: 'Test Client for Delete',
          machine_type: 'EXCAVATOR',
          model: 'Test Model',
          serial_number: 'TEST-DELETE-123',
          hourmeter: 1000,
          report_date: new Date().toISOString(),
          ott: 'TEST-OTT',
          components: [],
          suggested_parts: []
        })
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      reportId = response.body.data.id;
    });

    it('should allow admin to delete any report', async () => {
      const response = await request(app)
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should prevent non-admin users from deleting reports', async () => {
      // Crear otro reporte para esta prueba
      const reportData = {
        reportData: JSON.stringify({
          client_name: 'Test Client for Delete 2',
          machine_type: 'BULLDOZER',
          model: 'Test Model 2',
          serial_number: 'TEST-DELETE-456',
          hourmeter: 2000,
          report_date: new Date().toISOString(),
          ott: 'TEST-OTT-2',
          components: [],
          suggested_parts: []
        })
      };

      const createResponse = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData);

      const newReportId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/reports/${newReportId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only administrators can delete reports');
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .delete(`/api/reports/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Report not found');
    });

    it('should require authentication for deletion', async () => {
      const response = await request(app)
        .delete(`/api/reports/${reportId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 