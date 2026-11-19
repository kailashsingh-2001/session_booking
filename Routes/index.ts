import { Router } from 'express';
import { createTeacher } from '../controllers/teacher.controller';
import { createUser, getUserSessions } from '../controllers/user.controller';
import {
  bookSession,
  completeSession,
  createSession,
  getAvailableSessions,
} from '../controllers/session.controller';
import { asyncHandler } from '../Utils/asyncHandler';

const router = Router();

// Users
router.post('/users', asyncHandler(createUser)); // API 1
router.get('/users/:id/sessions', asyncHandler(getUserSessions)); // API 6

// Teachers (helper, for testing)
router.post('/teachers', asyncHandler(createTeacher));


router.post('/sessions', asyncHandler(createSession)); // API 2
router.get('/sessions/available', asyncHandler(getAvailableSessions)); // API 3
router.post('/sessions/:id/book', asyncHandler(bookSession)); // API 4
router.patch('/sessions/:id/complete', asyncHandler(completeSession)); // API 5

export default router;