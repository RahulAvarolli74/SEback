import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from '../middlewares/auth.middleware.js';

// ============================================================
// CONTROLLER IMPORTS (Aligned with your specific file structure)
// ============================================================

// 1. Student Controller
// (Make sure getStudentDashboard is defined and exported in student.controller.js)
import {
    loginStudent,
    logoutStudent,
    getStudentDashboard 
} from '../controllers/student.controller.js';

// 2. Admin Controller
// (Make sure getAdminDashboard is defined and exported in admin.controller.js)
import {
    loginadmin,
    logoutadmin,
    createStudentRoom,
    getAdminDashboard 
} from '../controllers/admin.controller.js';

// 3. Log Controller (Cleaning Logs)
import { 
    submitCleaningLog, 
    getMyRoomHistory, 
    getAllLogs 
} from "../controllers/log.controller.js";

// 4. Feedback Controller 
// (Renamed from 'issue' to 'feedback' to match your folder. 
//  Make sure these functions are exported in feedback.controller.js)
import { 
    raiseIssue, 
    getMyIssues,        
    getAllIssues,       
    updateIssueStatus   
} from "../controllers/feedback.controller.js"; 

// 5. Worker Controller
import { 
    getWorkersWithStats, 
    toggleWorkerStatus,
    addWorker          
} from "../controllers/worker.controller.js";


const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.route('/login-student').post(loginStudent);
router.route('/login-admin').post(loginadmin);
router.route('/enterdata').post(createStudentRoom); // Likely for seeding data

// ==========================================
// SECURED ROUTES (JWT Required)
// ==========================================

// --- AUTH LOGOUT ---
router.route('/logout-student').post(verifyJWT, logoutStudent);
router.route('/logout-admin').post(verifyJWT, logoutadmin);


// --- STUDENT FEATURES ---

// Dashboard (Welcome screen data)
router.route('/student/dashboard').get(verifyJWT, getStudentDashboard);

// Submit Cleaning Request (WITH IMAGE UPLOAD)
router.route('/student/submit-cleaning').post(
    verifyJWT, 
    upload.single("image"), // Expects form-data field named 'image'
    submitCleaningLog
);

// Raise Issue / Feedback (WITH IMAGE UPLOAD)
router.route('/student/raise-issue').post(
    verifyJWT,
    upload.single("image"), // Expects form-data field named 'image'
    raiseIssue
);

// View History of cleaning for their room
router.route('/student/history').get(verifyJWT, getMyRoomHistory);

// View Issues raised by this student
router.route('/student/my-issues').get(verifyJWT, getMyIssues);


// --- ADMIN FEATURES ---

// Dashboard (Charts & High-level stats)
router.route('/admin/dashboard').get(verifyJWT, getAdminDashboard);

// Logs (Master list of all cleaning logs)
router.route('/admin/logs').get(verifyJWT, getAllLogs);

// Worker Management
router.route('/admin/workers').post(verifyJWT, addWorker);                 // Add new worker
router.route('/admin/workers-stats').get(verifyJWT, getWorkersWithStats); // List workers with tasks
router.route('/admin/workers/:id/toggle').patch(verifyJWT, toggleWorkerStatus); // Active/Inactive

// Issue / Feedback Management
router.route('/admin/issues').get(verifyJWT, getAllIssues);               // View all issues
router.route('/admin/issues/:id').patch(verifyJWT, updateIssueStatus);    // Mark as resolved

export default router;