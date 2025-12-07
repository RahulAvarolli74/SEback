import { Log } from "../models/cleanlog.model.js"; // Ensure this matches your export
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// STUDENT: Submit Cleaning
const submitCleaningLog = asyncHandler(async (req, res) => {
    const { worker_id, cleanstatus, verification } = req.body;
    
    // 1. Get room_no (String) directly from the authenticated user
    const room_no = req.user.room_no; 

    if (!room_no) {
        throw new ApiError(400, "Room number is missing from user profile");
    }

    if (!worker_id || !cleanstatus) {
        throw new ApiError(400, "Worker and Status are required");
    }

    // 2. Duplicate Check: Search by room_no (String) for today's date
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await Log.findOne({
        room_no: room_no, // String comparison
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingLog) {
        throw new ApiError(409, "Cleaning log already submitted for today!");
    }

    // 3. Create Log using the String room_no
    const newLog = await Log.create({
        room_no: room_no, // Saving as String
        worker_id,
        cleanstatus, 
        verification: verification || "VERIFIED"
    });

    return res.status(201).json(
        new ApiRes(201, newLog, "Cleaning confirmed successfully")
    );
});

// STUDENT: Get History
const getMyRoomHistory = asyncHandler(async (req, res) => {
    const room_no = req.user.room_no; // String
    
    // Query matches room_no String in the DB
    const logs = await Log.find({ room_no: room_no })
        .populate("worker_id", "username block") 
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, logs, "Room cleaning history fetched")
    );
});

// ADMIN: Get All Logs
const getAllLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find({})
        .populate("worker_id", "username")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, logs, "All cleaning logs fetched")
    );
});

export { submitCleaningLog, getMyRoomHistory, getAllLogs };