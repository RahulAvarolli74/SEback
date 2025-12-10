import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/auth.middleware.js'; // Ensure you export this from auth middleware

// Import Controllers
import {
    loginadmin,
    logoutadmin,
    createStudentRoom,
    getAdminDashboard,
    getIssuesByRoom
} from '../controllers/admin.controller.js';

import { getAllLogs } from "../controllers/log.controller.js";

import { 
    getWorkersWithStats, 
    toggleWorkerStatus,
    addWorker          
} from "../controllers/worker.controller.js";

import { 
    getAllIssues,       
    resolveIssue 
} from "../controllers/feedback.controller.js"; 

const router = Router();


// PUBLIC ROUTES
router.route('/login').post(loginadmin);

// SECURED ROUTES (JWT + ADMIN CHECK)

// Note: verifyAdmin must come AFTER verifyJWT

// Auth
router.route('/logout').post(verifyJWT, verifyAdmin, logoutadmin);

// Dashboard & Setup
router.route('/dashboard').get(verifyJWT, verifyAdmin, getAdminDashboard);
router.route('/create-room').post(verifyJWT, verifyAdmin, createStudentRoom); 

// Logs Management
router.route('/logs').get(verifyJWT, verifyAdmin, getAllLogs);

// Worker Management
router.route('/workers').post(verifyJWT, verifyAdmin, addWorker);                
router.route('/workers-stats').get(verifyJWT, verifyAdmin, getWorkersWithStats); 
router.route('/workers/:id/toggle').patch(verifyJWT, verifyAdmin, toggleWorkerStatus); 

// Issue Management
router.route('/issues').get(verifyJWT, verifyAdmin, getAllIssues);               
router.route('/issues/room/:room_no').get(verifyJWT, verifyAdmin, getIssuesByRoom); 
router.route('/issues/:issueId/resolve').patch(verifyJWT, verifyAdmin, resolveIssue); 

export default router;