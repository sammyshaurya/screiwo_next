import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { auth, currentUser } from "@clerk/nextjs/server";

export const POST = async (req) => {
  await connectdb();
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    console.log("Creating profile");

    // Parse the request body
    const { profileData } = await req.json();
    const { profileType, gender, dob, mobile } = profileData;

    const existProfile = await Profile.findOne({ userid: userId });

    if (!existProfile) {
      // Create new profile
      const newProfile = new Profile({
        userid: userId,
        username: user.username,
        FirstName: user.firstName,
        LastName: user.lastName,
        profileType,
        gender,
        dob,
        mobile,
        profileImageUrl: user.imageUrl
      });
      await newProfile.save();

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
