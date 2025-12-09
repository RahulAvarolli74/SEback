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
        image: imageURL, // Store the string
        status: "Open"
    });

    return res.status(201).json(
        new ApiRes(201, newIssue, "Issue raised successfully")
    );
});

// ... (Include your getMyIssues and getAllIssues logic here) ...

export { raiseIssue };