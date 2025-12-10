import { Issue } from "../models/issue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const raiseIssue = asyncHandler(async (req, res) => {
    const { issueType, description } = req.body;
    const room_no = req.user.room_no;

    if (!issueType || !description) {
        throw new ApiError(400, "Issue Type and Description are required");
    }

    // 1. Handle Image Upload
    let imageLocalPath;
    if (req.file && req.file.path) {
        imageLocalPath = req.file.path;
    }

    let imageURL = "";
    if (imageLocalPath) {
        imageURL = await uploadOnCloudinary(imageLocalPath);
    }

    // 2. Create Issue
    const newIssue = await Issue.create({
        room_no,
        issueType,
        description,
        image: imageURL ? imageURL.url : "", // Ensure we store the URL string if it exists
        status: "Open"
    });

    return res.status(201).json(
        new ApiRes(201, newIssue, "Issue raised successfully")
    );
});

const getMyIssues = asyncHandler(async (req, res) => {
    const room_no = req.user.room_no;
    const issues = await Issue.find({ room_no }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, issues, "My issues fetched successfully")
    );
});

// --- ADMIN CONTROLLERS ---

// 1. Get Issues for a Specific Room
const getIssuesByRoom = asyncHandler(async (req, res) => {
    const { room_no } = req.params; // Admin sends room number in URL

    if (!room_no) {
        throw new ApiError(400, "Room number is required");
    }

    // Direct lookup since your Issue model stores 'room_no'
    const issues = await Issue.find({ room_no }).sort({ createdAt: -1 });

    if (!issues.length) {
        return res.status(200).json(new ApiRes(200, [], "No issues found for this room"));
    }

    return res.status(200).json(
        new ApiRes(200, issues, `Issues for room ${room_no} fetched successfully`)
    );
});

// 2. Get ALL Issues (For the main Admin Issue Dashboard)
const getAllIssues = asyncHandler(async (req, res) => {
    const issues = await Issue.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, issues, "All issues fetched successfully")
    );
});

// 3. Resolve/Update an Issue (Admin replying and closing)
const resolveIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { status, adminResponse } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        {
            $set: {
                status: status, // e.g., "Resolved", "In Progress"
                adminResponse: adminResponse || "" // Optional admin comment
            }
        },
        { new: true } // Return the updated document
    );

    if (!updatedIssue) {
        throw new ApiError(404, "Issue not found");
    }

    return res.status(200).json(
        new ApiRes(200, updatedIssue, "Issue updated successfully")
    );
});

export { 
    raiseIssue, 
    getMyIssues, 
    getIssuesByRoom, 
    getAllIssues, 
    resolveIssue 
};