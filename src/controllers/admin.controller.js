import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";           
import { User } from "../models/user.model.js";

const generateAccessTokenandRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);

    const genaccesstoken = user.generateAccessToken();
    const genrefreshtoken = user.generateRefreshToken();

    user.refreshtoken = genrefreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: genaccesstoken, refreshToken: genrefreshtoken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token and refresh token"
    );
  }
};

// ADMIN: create room credentials (room_no + password) in `users` collection
// room_no will be stored in `username`, password will be hashed with bcrypt
const enterdata = asyncHandler(async (req, res) => {
  const { room_no, password } = req.body;

  // basic validation
  if (!room_no || !password) {
    throw new ApiError(400, "room_no and password are required");
  }

  // check if room already exists
  const existing = await User.findOne({ username: room_no });
  if (existing) {
    throw new ApiError(409, "Room already exists in the database");
  }

  // hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // create user entry for this room
  const user = await User.create({
    username: room_no,       // you’ll use this as username during login
    password: hashedPassword,
    // you can add extra fields if your schema supports them, e.g.:
    role: "student",
    // roomNo: room_no,
  });

  return res.status(201).json(
    new ApiRes(
      201,
      {
        user: {
          _id: user._id,
          username: user.username,
        },
      },
      "Room credentials created successfully"
    )
  );
});

const loginadmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const userexist = await User.findOne({ username });
  if (!userexist) {
    throw new ApiError(400, "User does not exist");
  }

  const ispassvalid = await userexist.ispasswaordCorrect(password);
  if (!ispassvalid) {
    throw new ApiError(400, "Invalid Credentials.");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(userexist._id);

  const loggedinuser = await User.findById(userexist._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRes(
        200,
        {
          user: loggedinuser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutadmin = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshtoken: 1,
      },
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
    .json(new ApiRes(200, {}, "User logged out successfully"));
});

export { enterdata, loginadmin, logoutadmin };
