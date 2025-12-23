import { Issue } from "../models/issue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const raiseIssue = asyncHandler(async (req, res) => {
    const { issueType, description } = req.body;
    const room_no = req.user.room_no;
    const room_id = req.user._id; 

    if (!issueType || !description) {
        throw new ApiError(400, "Issue Type and Description are required");
    }

    let imageLocalPath;
    if (req.file && req.file.path) {
        imageLocalPath = req.file.path;
    }

    let imageURL = "";
    if (imageLocalPath) {
        const uploadResponse = await uploadOnCloudinary(imageLocalPath);
        if (uploadResponse) {
            imageURL = uploadResponse.url;
        }
    }

    const newIssue = await Issue.create({
        room_id: room_id, // Link to User ID
        room_no: room_no,
        issueType,
        description,
        image: imageURL, 
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


const getIssuesByRoom = asyncHandler(async (req, res) => {
    const { room_no } = req.params; 

    if (!room_no) {
        throw new ApiError(400, "Room number is required");
    }

    const issues = await Issue.find({ room_no }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, issues, `Issues for room ${room_no} fetched successfully`)
    );
});

const getAllIssues = asyncHandler(async (req, res) => {
    const issues = await Issue.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiRes(200, issues, "All issues fetched successfully")
    );
});

const resolveIssue = asyncHandler(async (req, res) => {
    const issueId = req.params.issueId || req.body.issueId; 
    const { status, adminResponse } = req.body;

    if (!issueId || !status) {
        throw new ApiError(400, "Issue ID and Status are required");
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
        issueId,
        {
            $set: {
                status: status, // e.g., "Resolved", "In Progress", "Closed"
                adminResponse: adminResponse || "" 
            }
        },
        { new: true }
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