import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { User } from "../models/user.model.js";

const generateAccessTokenAndRefreshToken = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshtoken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
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
    await generateAccessTokenAndRefreshToken(userexist._id);

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

export { loginStudent,logoutStudent };
