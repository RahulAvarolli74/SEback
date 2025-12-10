import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from '../middlewares/auth.middleware.js';

// Import Controllers
import {
    loginStudent,
    logoutStudent,
    getStudentDashboard 
} from '../controllers/student.controller.js';

import { 
    submitCleaningLog, 
    getMyRoomHistory 
} from "../controllers/log.controller.js";

import { 
    raiseIssue, 
    getMyIssues 
} from "../controllers/issue.controller.js"; // Or issue.controller.js

const router = Router();


router.route('/login').post(loginStudent);

//private routes


router.route('/logout').post(verifyJWT, logoutStudent);

// Dashboard
router.route('/dashboard').get(verifyJWT, getStudentDashboard);

// Cleaning Operations
router.route('/submit-cleaning').post(
    verifyJWT, 
    upload.single("image"), 
    submitCleaningLog
);
router.route('/history').get(verifyJWT, getMyRoomHistory);

// Issue Operations
router.route('/raise-issue').post(
    verifyJWT,
    upload.single("image"), 
    raiseIssue
);
router.route('/my-issues').get(verifyJWT, getMyIssues);

export default router;