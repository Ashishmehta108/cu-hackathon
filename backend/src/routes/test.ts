import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as testController from '../controllers/testController';

export const testRoutes = Router();

/** Firebase & Firestore testing endpoints for Postman */

// GET  /api/test/firebase       — Check Firebase connection
testRoutes.get('/firebase', asyncHandler(testController.testFirebase));

// POST /api/test/complaint      — Create sample complaint (body optional)
testRoutes.post('/complaint', asyncHandler(testController.createTestComplaint));

// GET  /api/test/complaints     — List all complaints
testRoutes.get('/complaints', asyncHandler(testController.listTestComplaints));

// GET  /api/test/complaints/:id — Get complaint by ID
testRoutes.get('/complaints/:id', asyncHandler(testController.getTestComplaint));

// GET  /api/test/cluster-count  — Test cluster count (?category=&village=&district=&state=)
testRoutes.get('/cluster-count', asyncHandler(testController.testClusterCount));

// GET  /api/test/wiki           — List all wiki entries
testRoutes.get('/wiki', asyncHandler(testController.listTestWiki));
