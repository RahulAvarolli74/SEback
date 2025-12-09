import { Log } from "../models/cleanlog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Import the utility

// STUDENT: Submit Cleaning
const submitCleaningLog = asyncHandler(async (req, res) => {
    // 1. Get text data
    const { worker_id, verification } = req.body;
    
    // Parse 'tasks' if it comes as a stringified array from frontend, or use directly
    // If frontend sends checkbox array: ["Sweeping", "Mopping"]
    const tasks = req.body.tasks; 

    // 2. Get room_no
    const room_no = req.user.room_no; 

    if (!room_no) throw new ApiError(400, "Room number is missing");
    if (!worker_id) throw new ApiError(400, "Worker ID is required");

    // 3. IMAGE UPLOAD LOGIC
    // Check if a file was uploaded by Multer
    let imageLocalPath;
    if (req.file && req.file.path) {
        imageLocalPath = req.file.path;
    }

    // Upload to Cloudinary to get the STRING
    let imageURL = "";
    if (imageLocalPath) {
        imageURL = await uploadOnCloudinary(imageLocalPath);
    }

    // 4. Duplicate Check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await Log.findOne({
        room_no: room_no,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingLog) {
        throw new ApiError(409, "Cleaning log already submitted for today!");
    }

    // 5. Create Log with the Image String
    const newLog = await Log.create({
        room_no: room_no,
        worker_id,
        tasks: tasks, // Ensure your Log model has 'tasks: [String]'
        verification: verification || "VERIFIED",
        image: imageURL // Saving the URL string here
    });

    return res.status(201).json(
        new ApiRes(201, newLog, "Cleaning confirmed successfully")
    );
});

// ... (Keep your getMyRoomHistory and getAllLogs exactly as they were) ...
// Just add export:
export { submitCleaningLog, getMyRoomHistory, getAllLogs };