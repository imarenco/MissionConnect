import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import authRoutes from '../authRoutes.js';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock bcrypt.hash
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      
      // Mock User.create
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'newuser@example.com',
        password: 'hashedPassword',
        toObject: () => ({
          _id: 'user123',
          name: 'Test User',
          email: 'newuser@example.com',
        }),
      };
      User.create = jest.fn().mockResolvedValue(mockUser);
      
      // Mock jwt.sign
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return existing user
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'existing123',
        email: 'existing@example.com',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      // Mock User.findOne to return user
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      
      // Mock jwt.sign
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return null
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if password is invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      // Mock User.findOne to return user
      User.findOne = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare to return false
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});

