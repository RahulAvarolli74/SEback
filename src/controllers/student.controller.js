import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { User } from "../models/user.model.js";
import { CleanLog } from "../models/cleanlog.model.js"; 
import { Feedback } from "../models/feedback.model.js"; 


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


const getStudentDashboard = asyncHandler(async (req, res) => {
  const room_no = req.user.room_no;

  // 1. Last Cleaning Date
  const lastCleaningLog = await CleanLog.findOne({ room_no })
    .sort({ createdAt: -1 });

  // 2. This Month's Cleanings
  const startOfMonth = new Date();
  startOfMonth.setDate(1); 
  startOfMonth.setHours(0, 0, 0, 0);
  
  const monthCount = await CleanLog.countDocuments({
    room_no: room_no,
    createdAt: { $gte: startOfMonth }
  });

  const openIssuesCount = await Issue.countDocuments({
    room_no: room_no,
    status: { $in: ["Open", "In Progress"] } 
  });

  const recentActivity = await CleanLog.find({ room_no })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("worker_id", "name"); 

  return res.status(200).json(
    new ApiRes(
      200,
      {
        room_no: room_no,
        stats: {
             lastCleaningDate: lastCleaningLog ? lastCleaningLog.createdAt : null,
             monthCount: monthCount,
             openIssues: openIssuesCount
        },
        recentActivity: recentActivity 
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