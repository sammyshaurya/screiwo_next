import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import User from "@/app/models/User.model";
import Profile from "@/app/models/Profile.model";
import bcrypt from "bcrypt";

export const GET = async (req) => {
  try {
    await connectdb();

    // Extract query parameters
    const searchParams = new URL(req.url).searchParams;
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (!username || !password) {
      return new NextResponse("Username and password are required", { status: 400 });
    }

    // Fetch user from database
    const user = await User.findOne({ username });

    if (!user) {
      return new NextResponse("Invalid username or password", { status: 400 });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return new NextResponse("Invalid username or password", { status: 400 });
    }

    // Fetch user profile
    const userProfile = await Profile.findOne({ userid: user._id });

    if (userProfile) {
      return NextResponse.json({ message: "User already profiled", profiled: true, token: user.token }, { status: 200 });
    }

    

    return NextResponse.json({ profiled: false, token: user.token }, { status: 200 });

  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
