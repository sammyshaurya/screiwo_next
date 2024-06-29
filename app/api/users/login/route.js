import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import User from "@/app/models/User.model";
import Profile from "@/app/models/Profile.model";
import bcrypt from "bcrypt";

export const GET = async (req) => {
  await connectdb();
  const searchParams = new URL(req.url).searchParams;
  try {
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (!username || !password) {
      return NextResponse.json("Username and password are required", { status: 400 });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json("Invalid username or password", { status: 400 });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json("Invalid username or password", { status: 400 });
    }

    // Fetch user profile
    const userProfile = await Profile.findOne({ userid: user._id });

    if (userProfile) {
      return NextResponse.json({ message: "User already profiled", profiled: true, token: user.token }, { status: 200 });
    }

    

    return NextResponse.json({ profiled: false, token: user.token }, { status: 200 });

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
