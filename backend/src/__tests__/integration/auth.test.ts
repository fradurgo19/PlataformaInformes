import request from 'supertest';
import app from '../../index';
import pool from '../../config/database';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Limpiar base de datos de prueba
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
  });

  afterAll(async () => {
    // Limpiar después de las pruebas
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['test_%']);
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'test_user_1',
        email: 'test1@example.com',
        password: 'password123',
        full_name: 'Test User 1',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.full_name).toBe(userData.full_name);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.password_hash).toBeUndefined();
    });

    it('should not register duplicate username', async () => {
      const userData = {
        username: 'test_user_2',
        email: 'test2@example.com',
        password: 'password123',
        full_name: 'Test User 2',
        role: 'user'
      };

      // Primera vez
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Segunda vez con mismo username
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Username or email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const userData = {
        username: 'test_user_3',
        email: 'test3@example.com',
        password: 'password123',
        full_name: 'Test User 3',
        role: 'user'
      };

      // Registrar usuario
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user_3',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;

    beforeAll(async () => {
      // Crear usuario y obtener token
      const userData = {
        username: 'test_user_4',
        email: 'test4@example.com',
        password: 'password123',
        full_name: 'Test User 4',
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
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('test_user_4');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 