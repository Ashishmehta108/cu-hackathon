import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { create } from '../src/controllers/complaintController';

// Mock Supabase
jest.mock('../src/config/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn(() => ({ publicUrl: 'https://test-supabase.com/test-image.png' })),
      })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-id',
              text: 'Test complaint',
              language: 'en',
              category: 'Infrastructure',
              keywords: ['test'],
              department: 'Test Department',
              location: { village: 'Test Village', district: 'Test District', state: 'Test State' },
              status: 'pending',
              petition: 'Test petition',
              audio_url: null,
              image_url: 'https://test-supabase.com/test-image.png',
              image_timestamp: '2023-01-01T00:00:00.000Z',
              cluster_id: 'Infrastructure|Test Village|Test District|Test State',
              cluster_count: 1,
              escalation_level: 0,
              last_escalation_date: null,
              status_history: [{ status: 'pending', timestamp: '2023-01-01T00:00:00.000Z' }],
              emails: [],
              created_at: '2023-01-01T00:00:00.000Z',
              updated_at: '2023-01-01T00:00:00.000Z',
            },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    composite: jest.fn(() => ({
      png: jest.fn(() => ({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-buffer')),
      })),
    })),
  }));
});

describe('Complaint Controller - File Upload', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Setup multer for file uploads
    const upload = multer({ storage: multer.memoryStorage() });
    app.post('/complaints', upload.single('image'), create);
  });

  it('should handle complaint creation with image upload', async () => {
    const complaintData = {
      text: 'Test complaint text',
      language: 'en',
      category: 'Infrastructure',
      keywords: JSON.stringify(['water', 'shortage']),
      department: 'Public Works Department',
      location: JSON.stringify({
        village: 'Test Village',
        district: 'Test District',
        state: 'Test State'
      }),
      status: 'pending',
      petition: 'Test petition text',
    };

    // Create a mock image file
    const imageBuffer = Buffer.from('mock image data');
    const imageFile = {
      fieldname: 'image',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: imageBuffer,
      size: imageBuffer.length,
    };

    const response = await request(app)
      .post('/complaints')
      .field('text', complaintData.text)
      .field('language', complaintData.language)
      .field('category', complaintData.category)
      .field('keywords', complaintData.keywords)
      .field('department', complaintData.department)
      .field('location', complaintData.location)
      .field('status', complaintData.status)
      .field('petition', complaintData.petition)
      .attach('image', imageBuffer, 'test-image.jpg');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('imageUrl');
    expect(response.body.imageUrl).toBe('https://test-supabase.com/test-image.png');
  });

  it('should handle complaint creation without image', async () => {
    const complaintData = {
      text: 'Test complaint without image',
      language: 'en',
      category: 'Health',
      keywords: JSON.stringify(['medical', 'facility']),
      department: 'Health Department',
      location: JSON.stringify({
        village: 'Test Village 2',
        district: 'Test District 2',
        state: 'Test State 2'
      }),
      status: 'pending',
      petition: 'Test petition without image',
    };

    const response = await request(app)
      .post('/complaints')
      .field('text', complaintData.text)
      .field('language', complaintData.language)
      .field('category', complaintData.category)
      .field('keywords', complaintData.keywords)
      .field('department', complaintData.department)
      .field('location', complaintData.location)
      .field('status', complaintData.status)
      .field('petition', complaintData.petition);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.imageUrl).toBeUndefined();
  });

  it('should handle Supabase storage upload error gracefully', async () => {
    // Mock storage upload to fail
    const mockSupabase = require('../src/config/supabase').supabase;
    mockSupabase.storage.from.mockReturnValueOnce({
      upload: jest.fn().mockResolvedValue({ data: null, error: { message: 'Upload failed' } }),
      getPublicUrl: jest.fn(() => ({ publicUrl: '' })),
    });

    const complaintData = {
      text: 'Test complaint with upload error',
      language: 'en',
      category: 'Education',
      keywords: JSON.stringify(['school', 'books']),
      department: 'Education Department',
      location: JSON.stringify({
        village: 'Test Village 3',
        district: 'Test District 3',
        state: 'Test State 3'
      }),
      status: 'pending',
      petition: 'Test petition with upload error',
    };

    const imageBuffer = Buffer.from('mock image data');

    const response = await request(app)
      .post('/complaints')
      .field('text', complaintData.text)
      .field('language', complaintData.language)
      .field('category', complaintData.category)
      .field('keywords', complaintData.keywords)
      .field('department', complaintData.department)
      .field('location', complaintData.location)
      .field('status', complaintData.status)
      .field('petition', complaintData.petition)
      .attach('image', imageBuffer, 'test-image.jpg');

    // Should still succeed but without image URL
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.imageUrl).toBeUndefined();
  });
});
