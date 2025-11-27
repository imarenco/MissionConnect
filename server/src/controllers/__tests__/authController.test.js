import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { registerUser, loginUser } from '../authController.js';

// Mock bcrypt and jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
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
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      User.create = jest.fn().mockResolvedValue(mockUser);
      
      // Mock jwt.sign
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        },
        token: 'mockToken',
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return existing user
      User.findOne = jest.fn().mockResolvedValue({
        _id: 'existing123',
        email: 'test@example.com',
      });

      await registerUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to throw an error
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      
      consoleSpy.mockRestore();
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      req.body = {
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

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        user: {
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
        },
        token: 'mockToken',
      });
    });

    it('should return 400 if user not found', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return null
      User.findOne = jest.fn().mockResolvedValue(null);

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 400 if password is invalid', async () => {
      req.body = {
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

      await loginUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to throw an error
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      
      consoleSpy.mockRestore();
    });
  });
});

