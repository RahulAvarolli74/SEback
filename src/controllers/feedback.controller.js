import { Feed } from "../models/feedback.model.js";
import { Worker } from "../models/worker.model.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const submitFeedback = asyncHandler(async (req, res) => {
    const { worker_id, comment, rating, verification } = req.body;
    
    // We have the String, but Schema needs ObjectId
    const roomNoString = req.user.room_no; 

    if (!worker_id || !rating) {
        throw new ApiError(400, "Worker ID and Rating are required");
    }

    // 1. Find the Room document using the String to get its ObjectId
    const roomDoc = await Room.findOne({ room_no: roomNoString });
    
    if (!roomDoc) {
        throw new ApiError(404, "Room not found in database");
    }

    // 2. Save Feedback using the Room's ObjectId (as per your feedSchema)
    const feedback = await Feed.create({
        room_id: roomDoc._id, 
        worker_id,
        comment,
        rating,
        verification: verification || "VERIFIED"
    });

    // 3. Update Worker Rating
    const stats = await Feed.aggregate([
        { $match: { worker_id: new mongoose.Types.ObjectId(worker_id) } },
        { $group: { _id: "$worker_id", avgRating: { $avg: "$rating" } } }
    ]);

    if (stats.length > 0) {
        await Worker.findByIdAndUpdate(worker_id, {
            rating: parseFloat(stats[0].avgRating.toFixed(1))
        });
    }

    return res.status(201).json(
        new ApiRes(201, feedback, "Feedback submitted successfully")
    );
});

export { submitFeedback };