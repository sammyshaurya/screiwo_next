import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import { connectdb } from "@/app/lib/db";
import User from "@/app/models/User.model";
import Profile from "@/app/models/Profile.model";
import jwt from "jsonwebtoken";

export const POST = async (req, res) => {
    await connectdb();
    try {
    console.log("Creating profile");
    // Parse the request body
    const { profileData, token } = await req.json();
    await verifyUser(req, res, token);
    
    if (req.verified === false || req.verified === null) {
        return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }
    const { profileType, gender, dob, mobile } = profileData;

    // Verify token and extract user ID
    const decodedToken = jwt.verify(token, process.env.jwt_secret);
    const userId = decodedToken._id;

    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existProfile = await Profile.findOne({ userid: userId });
    if (!existProfile) {
      // Create new profile
      const newProfile = new Profile({
        userid: userId,
        username: dbUser.username,
        FirstName: dbUser.firstname,
        LastName: dbUser.lastname,
        profileType,
        gender,
        dob,
        mobile,
      });
      await newProfile.save();

      dbUser.isVerified = true;
      await dbUser.save();

      return NextResponse.json({ message: "Profile created successfully" }, { status: 201 });
    } else {
      // Update existing profile
      existProfile.profileType = profileType;
      existProfile.gender = gender;
      existProfile.dob = dob;
      existProfile.mobile = mobile;
      await existProfile.save();

      return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
