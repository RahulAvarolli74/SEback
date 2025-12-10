import { Log } from "../models/cleanlog.model.js"; // Ensure filename matches
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const submitCleaningLog = asyncHandler(async (req, res) => {
    const { worker_id, tasks, feedback, rating } = req.body;
    
    const room_no = req.user.room_no; 
    const room_id = req.user._id; 

    // 3. Validation
    if (!worker_id) throw new ApiError(400, "Worker selection is required");
    if (!tasks || tasks.length === 0) throw new ApiError(400, "At least one task must be selected");

    // 4. IMAGE UPLOAD LOGIC
    let imageLocalPath;
    if (req.file && req.file.path) {
        imageLocalPath = req.file.path;
    }

    let imageURL = "";
    if (imageLocalPath) {
        const uploadResponse = await uploadOnCloudinary(imageLocalPath);
        if (uploadResponse) {
             imageURL = uploadResponse.url; // <--- Extract .url property
        }
    }

    // 5. Duplicate Check (Prevent submitting twice in one day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await Log.findOne({
        room_no: room_no,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingLog) {
        throw new ApiError(409, "You have already submitted a cleaning log for today!");
    }

    // 6. Create Log
    // We map frontend field names to Schema field names here
    const newLog = await Log.create({
        room_id: room_id,          
        room_no: room_no,          
        worker: worker_id,        
        cleaningType: tasks,       
        cleanstatus: "Verified",   
        feedback: feedback || "",  
        rating: rating || null,   
        image: imageURL          
    });

    return res.status(201).json(
        new ApiRes(201, newLog, "Cleaning confirmed successfully")
    );
});

// STUDENT: Get History
const getMyRoomHistory = asyncHandler(async (req, res) => {
    const room_no = req.user.room_no;
    
    const history = await Log.find({ room_no })
        .populate("worker", "name") // Get worker name instead of just ID
        .sort({ createdAt: -1 });   // Newest first

    return res.status(200).json(
        new ApiRes(200, history, "Cleaning history fetched successfully")
    );
});

// ADMIN: Get All Logs
const getAllLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find()
        .populate("worker", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, logs, "All cleaning logs fetched")
    );
});

export { submitCleaningLog, getMyRoomHistory, getAllLogs };