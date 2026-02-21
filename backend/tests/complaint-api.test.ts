import request from 'supertest';
import express from 'express';
import { complaintRoutes } from '../src/routes/complaints';

// Mock the entire complaint service
jest.mock('../src/services/complaintService', () => ({
  createComplaint: jest.fn(),
  getComplaints: jest.fn(),
  getComplaintById: jest.fn(),
  updateComplaint: jest.fn(),
  updateComplaintStatus: jest.fn(),
  deleteComplaint: jest.fn(),
  countByCategory: jest.fn(),
  getClusterCount: jest.fn(),
}));

import * as complaintService from '../src/services/complaintService';

describe('Complaint API Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/complaints', complaintRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/complaints', () => {
    it('should create a complaint successfully', async () => {
      const mockComplaint = {
        id: 'test-id',
        text: 'Test complaint',
        language: 'en',
        category: 'infrastructure',
        keywords: ['water', 'shortage'],
        department: 'Public Works Department',
        location: { village: 'Test Village', district: 'Test District', state: 'Test State' },
        status: 'pending',
        petition: 'Test petition',
        audioUrl: null,
        imageUrl: null,
        imageTimestamp: null,
        clusterId: 'Infrastructure|Test Village|Test District|Test State',
        clusterCount: 1,
        escalationLevel: 0,
        lastEscalationDate: null,
        statusHistory: [{ status: 'pending', timestamp: '2023-01-01T00:00:00.000Z' }],
        emails: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      (complaintService.createComplaint as jest.Mock).mockResolvedValue(mockComplaint);

      const complaintData = {
        text: 'Test complaint text',
        language: 'en',
        category: 'Infrastructure',
        keywords: ['water', 'shortage'],
        department: 'Public Works Department',
        location: { village: 'Test Village', district: 'Test District', state: 'Test State' },
        petition: 'Test petition',
      };

      const response = await request(app)
        .post('/api/complaints')
        .send(complaintData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockComplaint);
      expect(complaintService.createComplaint).toHaveBeenCalledWith(
        expect.objectContaining({
          text: complaintData.text,
          language: complaintData.language,
          category: 'infrastructure', // Should be converted to frontend format
          keywords: complaintData.keywords,
          department: complaintData.department,
          location: complaintData.location,
          petition: complaintData.petition,
        })
      );
    });

    it('should handle service errors', async () => {
      (complaintService.createComplaint as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const complaintData = {
        text: 'Test complaint',
        language: 'en',
        category: 'Infrastructure',
        keywords: ['test'],
        department: 'Test Department',
        location: { village: 'Test', district: 'Test', state: 'Test' },
      };

      const response = await request(app)
        .post('/api/complaints')
        .send(complaintData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/complaints', () => {
    it('should return complaints list', async () => {
      const mockComplaints = [
        {
          id: '1',
          text: 'Complaint 1',
          language: 'en',
          category: 'infrastructure',
          keywords: ['water'],
          department: 'PWD',
          location: { village: 'Village 1', district: 'District 1', state: 'State 1' },
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      (complaintService.getComplaints as jest.Mock).mockResolvedValue(mockComplaints);

      const response = await request(app).get('/api/complaints');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComplaints);
      expect(complaintService.getComplaints).toHaveBeenCalledWith({});
    });

    it('should filter complaints by status', async () => {
      const mockComplaints = [
        {
          id: '1',
          text: 'Resolved complaint',
          language: 'en',
          category: 'infrastructure',
          keywords: ['water'],
          department: 'PWD',
          location: { village: 'Village 1', district: 'District 1', state: 'State 1' },
          status: 'resolved',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      (complaintService.getComplaints as jest.Mock).mockResolvedValue(mockComplaints);

      const response = await request(app)
        .get('/api/complaints')
        .query({ status: 'resolved' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComplaints);
      expect(complaintService.getComplaints).toHaveBeenCalledWith({ status: 'resolved' });
    });

    it('should filter complaints by category', async () => {
      const mockComplaints = [
        {
          id: '1',
          text: 'Health complaint',
          language: 'en',
          category: 'health',
          keywords: ['medical'],
          department: 'Health Dept',
          location: { village: 'Village 1', district: 'District 1', state: 'State 1' },
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      (complaintService.getComplaints as jest.Mock).mockResolvedValue(mockComplaints);

      const response = await request(app)
        .get('/api/complaints')
        .query({ category: 'Health' });

      expect(response.status).toBe(200);
      expect(complaintService.getComplaints).toHaveBeenCalledWith({ category: 'Health' });
    });
  });

  describe('GET /api/complaints/:id', () => {
    it('should return a complaint by ID', async () => {
      const mockComplaint = {
        id: 'test-id',
        text: 'Test complaint',
        language: 'en',
        category: 'infrastructure',
        keywords: ['water'],
        department: 'PWD',
        location: { village: 'Village 1', district: 'District 1', state: 'State 1' },
        status: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      (complaintService.getComplaintById as jest.Mock).mockResolvedValue(mockComplaint);

      const response = await request(app).get('/api/complaints/test-id');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComplaint);
      expect(complaintService.getComplaintById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 for non-existent complaint', async () => {
      (complaintService.getComplaintById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/complaints/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Complaint not found');
    });
  });

  describe('PUT /api/complaints/:id', () => {
    it('should update a complaint', async () => {
      const updatedComplaint = {
        id: 'test-id',
        text: 'Updated complaint',
        language: 'en',
        category: 'infrastructure',
        keywords: ['water'],
        department: 'PWD',
        location: { village: 'Village 1', district: 'District 1', state: 'State 1' },
        status: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T01:00:00.000Z',
      };

      (complaintService.updateComplaint as jest.Mock).mockResolvedValue(updatedComplaint);

      const updateData = { text: 'Updated complaint text', status: 'in_progress' };

      const response = await request(app)
        .put('/api/complaints/test-id')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedComplaint);
      expect(complaintService.updateComplaint).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should return 404 when updating non-existent complaint', async () => {
      (complaintService.updateComplaint as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/complaints/non-existent-id')
        .send({ text: 'Updated text' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Complaint not found');
    });
  });

  describe('DELETE /api/complaints/:id', () => {
    it('should delete a complaint', async () => {
      (complaintService.deleteComplaint as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/api/complaints/test-id');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Complaint deleted successfully');
      expect(complaintService.deleteComplaint).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when deleting non-existent complaint', async () => {
      (complaintService.deleteComplaint as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/api/complaints/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Complaint not found');
    });
  });

  describe('GET /api/complaints/analytics', () => {
    it('should return analytics data', async () => {
      const mockAnalytics = {
        byCategory: {
          infrastructure: 5,
          health: 3,
          education: 2,
        },
      };

      (complaintService.countByCategory as jest.Mock).mockResolvedValue(mockAnalytics.byCategory);

      const response = await request(app).get('/api/complaints/analytics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('byCategory');
      expect(response.body.byCategory).toEqual(mockAnalytics.byCategory);
    });
  });

  describe('GET /api/complaints/cluster-count', () => {
    it('should return cluster count', async () => {
      (complaintService.getClusterCount as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .get('/api/complaints/cluster-count')
        .query({
          category: 'Infrastructure',
          village: 'Test Village',
          district: 'Test District',
          state: 'Test State'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clusterCount', 3);
      expect(complaintService.getClusterCount).toHaveBeenCalledWith('Infrastructure', {
        village: 'Test Village',
        district: 'Test District',
        state: 'Test State'
      });
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .get('/api/complaints/cluster-count')
        .query({ village: 'Test Village' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required query param: category');
    });
  });
});
