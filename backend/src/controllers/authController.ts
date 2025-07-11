import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../types';
import logger from '../utils/logger';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    // Find user by username
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };
    
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    };

    // Log successful login
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    logger.logUserLogin(user.id, user.username, clientIp, userAgent);

    res.json(response);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, full_name, role = 'user' } = req.body;

    if (!username || !email || !password || !full_name) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    // Validate role
    if (role && !['admin', 'user', 'viewer'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin, user, or viewer'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role, created_at, updated_at',
      [username, email, passwordHash, full_name, role]
    );

    const newUser = newUserResult.rows[0];

    const response: ApiResponse<User> = {
      success: true,
      data: newUser,
      message: 'User registered successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const userResult = await pool.query(
      'SELECT id, username, email, full_name, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: userResult.rows[0]
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { full_name, email, password } = req.body;

    if (!full_name || !email) {
      res.status(400).json({
        success: false,
        error: 'Full name and email are required'
      });
      return;
    }

    // Check if email is already used by another user
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, userId]
    );
    if (emailCheck.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email is already in use by another user'
      });
      return;
    }

    let updateQuery = '';
    let params: any[] = [];
    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateQuery = 'UPDATE users SET full_name = $1, email = $2, password_hash = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, full_name, role, created_at, updated_at';
      params = [full_name, email, passwordHash, userId];
    } else {
      updateQuery = 'UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, full_name, role, created_at, updated_at';
      params = [full_name, email, userId];
    }

    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersResult = await pool.query(
      'SELECT id, full_name, username, email, role, created_at, updated_at FROM users ORDER BY full_name ASC'
    );
    res.json({ success: true, data: usersResult.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, email, role, password } = req.body;
    const currentUser = (req as any).user;

    // Solo admins pueden editar usuarios
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    if (!full_name || !email || !role) {
      res.status(400).json({
        success: false,
        error: 'Full name, email and role are required'
      });
      return;
    }

    // Validar rol
    if (!['admin', 'user', 'viewer'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin, user, or viewer'
      });
      return;
    }

    // Verificar si el email ya está en uso por otro usuario
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email is already in use by another user'
      });
      return;
    }

    let updateQuery = '';
    let params: any[] = [];
    
    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateQuery = 'UPDATE users SET full_name = $1, email = $2, role = $3, password_hash = $4, updated_at = NOW() WHERE id = $5 RETURNING id, username, email, full_name, role, created_at, updated_at';
      params = [full_name, email, role, passwordHash, id];
    } else {
      updateQuery = 'UPDATE users SET full_name = $1, email = $2, role = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, full_name, role, created_at, updated_at';
      params = [full_name, email, role, id];
    }

    const result = await pool.query(updateQuery, params);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    // Solo admins pueden eliminar usuarios
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    // No permitir eliminar el propio usuario
    if (currentUser.id === id) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
      return;
    }

    // Verificar si el usuario existe
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    if (userCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Eliminar usuario
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    const response: ApiResponse<boolean> = {
      success: true,
      data: true,
      message: 'User deleted successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 