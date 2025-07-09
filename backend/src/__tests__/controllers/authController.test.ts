import request from 'supertest';
import express from 'express';
import { login, register, getProfile, updateProfile } from '../../controllers/authController';
import { authenticateToken } from '../../middleware/auth';

// Mock de la base de datos
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const app = express();
app.use(express.json());

// Rutas de prueba
app.post('/login', login as any);
app.post('/register', register as any);
app.get('/profile', authenticateToken as any, getProfile as any);
app.put('/profile', authenticateToken as any, updateProfile as any);

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 401 for invalid credentials', async () => {
      const mockQuery = require('../../config/database').pool.query;
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('All fields are required');
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid role. Must be admin, user, or viewer');
    });

    it('should return 400 if user already exists', async () => {
      const mockQuery = require('../../config/database').pool.query;
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Existing User',
          role: 'user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username or email already exists');
    });
  });

  describe('GET /profile', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /profile', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/profile')
        .send({ full_name: 'New Name', email: 'new@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });
}); 