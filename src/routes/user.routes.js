import { Router } from "express";
import {
    loginStudent,
    logoutStudent
} from '../controllers/student.controller.js'

import {
    loginadmin,
    logoutadmin
} from '../controllers/admin.controller.js'

import {verifyJWT} from '../middlewares/auth.middleware.js'



const router=Router();

router.route('/login-student').post(loginStudent)
router.route('/login-admin').post(loginadmin)

//secured routes
router.route('logout-student').post(verifyJWT,logoutStudent)
router.route('logout-admin').post(verifyJWT,loginadmin)



export default router;