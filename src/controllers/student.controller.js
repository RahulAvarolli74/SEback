import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { User } from "../models/user.model.js";

// --- NEW IMPORTS (Required for Dashboard) ---
import { CleanLog } from "../models/cleanlog.model.js"; 
import { Feedback } from "../models/feedback.model.js"; 
// --------------------------------------------

const generateAccessTokenandRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshtoken = refreshToken;
    
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);   
    throw new ApiError(
      500,
      "Something went wrong while generating access & refresh tokens"
    );
  }
};


// STUDENT LOGIN
const loginStudent = asyncHandler(async (req, res) => {
  const { room_no, password } = req.body;

  if (!room_no || !password) {
    throw new ApiError(400, "room_no and password are required");
  }

  const userexist = await User.findOne({
    room_no
    // role: "STUDENT",
  });
   console.log(userexist);

  if (!userexist) {
    throw new ApiError(400, "Room notfound ");
  }
  
  const ispassvalid = await userexist.ispasswordCorrect(password);

  if (!ispassvalid) {
    throw new ApiError(400, "Room credentials invalid");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(userexist._id);

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRes(
        200,
        {
          user: {
            _id: userexist._id,
            room_no: userexist.room_no,
            role: userexist.role,
          },
          accessToken,
          refreshToken,
        },
        "Student logged in successfully"
      )
    );
});

// STUDENT LOGOUT
const logoutStudent = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshtoken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRes(200, {}, "Student logged out successfully"));
});


// NEW FEATURE: STUDENT DASHBOARD
const getStudentDashboard = asyncHandler(async (req, res) => {
  // req.user is set by the verifyJWT middleware
  const studentId = req.user._id;

  // 1. Fetch the most recent cleaning log for this student
  const lastCleaning = await CleanLog.findOne({ student: studentId })
    .sort({ createdAt: -1 }) // Sort descending (newest first)
    .limit(1);

  // 2. Fetch count of active (unresolved) issues
  const activeIssuesCount = await Feedback.countDocuments({
    student: studentId,
    status: { $ne: "Resolved" } // Count everything that is NOT "Resolved"
  });

  return res.status(200).json(
    new ApiRes(
      200,
      {
        room_no: req.user.room_no,
        role: req.user.role,
        last_cleaning: lastCleaning ? {
             status: lastCleaning.status,
             date: lastCleaning.createdAt,
             worker_id: lastCleaning.worker
        } : null,
        active_issues: activeIssuesCount
      },
      "Student dashboard data fetched successfully"
    )
  );
});


export { 
  loginStudent, 
  logoutStudent, 
  getStudentDashboard
 };