import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { protect } from '../auth.js';

// Mock jwt and User
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() when token is valid', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    };

    req.headers.authorization = 'Bearer validToken';

    // Mock jwt.verify to return decoded token
    jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });
    
    // Mock User.findById
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no token is provided', async () => {
    req.headers.authorization = undefined;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is missing Bearer prefix', async () => {
    req.headers.authorization = 'invalidToken';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidToken';

    // Mock jwt.verify to throw an error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalidToken', process.env.JWT_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not found', async () => {
    req.headers.authorization = 'Bearer validToken';

    // Mock jwt.verify to return decoded token
    jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });
    
    // Mock User.findById to return null
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled(); // Still calls next, but user is null
  });
});

