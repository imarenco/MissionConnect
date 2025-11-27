import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import Visit from '../../models/Visit.js';
import Contact from '../../models/Contact.js';
import {
  createVisit,
  getVisits,
  deleteVisit,
} from '../visitController.js';

describe('Visit Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    // Restore all mocks to ensure real database operations
    jest.restoreAllMocks();
  });

  describe('createVisit', () => {
    it('should create a new visit', async () => {
      // Create a contact first
      const contact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        owner: req.user._id,
        missionary: req.user._id,
      });
      await contact.save();

      const datetime = new Date('2024-12-25T10:00:00Z');

      req.body = {
        contact: contact._id.toString(),
        datetime: datetime.toISOString(),
        notes: 'Test visit notes',
      };
      
      // Ensure no mocks interfere with real database operations
      jest.restoreAllMocks();
      // Also clear any direct assignments to model methods
      delete Contact.findById;

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const createdVisit = res.json.mock.calls[0][0];
      if (createdVisit) {
        expect(createdVisit.notes).toBe('Test visit notes');
        // contact might be populated, so check both ID and object
        const contactId = createdVisit.contact?._id?.toString() || createdVisit.contact?.toString() || createdVisit.contact;
        expect(contactId.toString()).toBe(contact._id.toString());
        
        // Clean up
        await Visit.deleteOne({ _id: createdVisit._id });
      }
      await Contact.deleteOne({ _id: contact._id });
    });

    it('should return 400 if contact is missing', async () => {
      req.body = {
        datetime: new Date().toISOString(),
      };

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact and datetime are required.' });
    });

    it('should return 400 if datetime is missing', async () => {
      const contactId = new mongoose.Types.ObjectId();
      req.body = {
        contact: contactId.toString(),
      };

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact and datetime are required.' });
    });

    it('should return 400 if datetime is invalid', async () => {
      req.body = {
        contact: 'contact123',
        datetime: 'invalid-date',
      };

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid datetime format. Provide ISO datetime.' });
    });

    it('should return 404 if contact does not exist', async () => {
      const contactId = new mongoose.Types.ObjectId();
      req.body = {
        contact: contactId.toString(),
        datetime: new Date().toISOString(),
      };

      Contact.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found' });
    });

    it('should use default empty notes if not provided', async () => {
      // Create a contact first
      const contact = new Contact({
        firstName: 'John',
        lastName: 'Doe',
        phone: `1234567890${Date.now()}${Math.random()}`,
        owner: req.user._id,
        missionary: req.user._id,
      });
      await contact.save();

      const datetime = new Date('2024-12-25T10:00:00Z');
      req.body = {
        contact: contact._id.toString(),
        datetime: datetime.toISOString(),
      };
      
      // Ensure no mocks interfere with real database operations
      jest.restoreAllMocks();
      // Also clear any direct assignments to model methods
      delete Contact.findById;

      await createVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const createdVisit = res.json.mock.calls[0][0];
      if (createdVisit) {
        expect(createdVisit.notes).toBe('');
        
        // Clean up
        await Visit.deleteOne({ _id: createdVisit._id });
      }
      await Contact.deleteOne({ _id: contact._id });
    });
  });

  describe('getVisits', () => {
    it('should return all visits for the user', async () => {
      const mockVisits = [
        {
          _id: new mongoose.Types.ObjectId(),
          contact: { firstName: 'John', lastName: 'Doe' },
          datetime: new Date('2024-12-25T10:00:00Z'),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          contact: { firstName: 'Jane', lastName: 'Smith' },
          datetime: new Date('2024-12-26T14:00:00Z'),
        },
      ];

      Visit.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockVisits),
          }),
        }),
      });

      await getVisits(req, res);

      expect(Visit.find).toHaveBeenCalledWith({ user: req.user._id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVisits);
    });

    it('should filter visits by contactId if provided', async () => {
      const contactId = new mongoose.Types.ObjectId();
      req.query.contactId = contactId.toString();

      Visit.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getVisits(req, res);

      expect(Visit.find).toHaveBeenCalledWith({
        user: req.user._id,
        contact: contactId.toString(),
      });
    });

    it('should handle user id from req.user.id', async () => {
      const userId = new mongoose.Types.ObjectId();
      req.user = { id: userId };

      Visit.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getVisits(req, res);

      expect(Visit.find).toHaveBeenCalledWith({ user: userId });
    });
  });

  describe('deleteVisit', () => {
    it('should delete a visit', async () => {
      const visitId = new mongoose.Types.ObjectId();
      req.params.id = visitId.toString();

      const mockVisit = {
        _id: visitId,
        user: req.user._id,
      };

      Visit.findOne = jest.fn().mockResolvedValue(mockVisit);
      Visit.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      await deleteVisit(req, res);

      expect(Visit.findOne).toHaveBeenCalledWith({
        _id: visitId.toString(),
        user: req.user._id,
      });
      expect(Visit.deleteOne).toHaveBeenCalledWith({ _id: visitId.toString() });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visit deleted successfully' });
    });

    it('should return 404 if visit not found', async () => {
      req.params.id = 'visit123';

      Visit.findOne = jest.fn().mockResolvedValue(null);

      await deleteVisit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Visit not found' });
    });

    it('should handle user id from req.user.id', async () => {
      req.params.id = 'visit123';
      req.user = { id: 'user456' };

      Visit.findOne = jest.fn().mockResolvedValue(null);

      await deleteVisit(req, res);

      expect(Visit.findOne).toHaveBeenCalledWith({
        _id: 'visit123',
        user: 'user456',
      });
    });
  });
});

