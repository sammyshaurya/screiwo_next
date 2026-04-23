import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import User from "@/app/models/User.model";
import bcrypt from "bcrypt";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";

export const POST = async (req, res) => {
  await connectdb();
  const body = await req.json();
  if (!body) {
    return new NextResponse("Please fill all the fields", {status: 400})
  }

  try {
    const { username, email, password, firstname, lastname } = body;
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername || !email || !password || !firstname || !lastname) {
      
      return new NextResponse("Please fill all the fields", {status: 400})

    }
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: createUsernameRegex(normalizedUsername) },
      ],
    });
    if (existingUser) {
      return new NextResponse("Email or username already exists", {status:400})
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: normalizedUsername,
      email,
      password: hash,
      firstname,
      lastname,
    });
    console.log(newUser);

    await newUser.save();
    return NextResponse.json({message: "Account created successfully. Please sign in with Clerk."}, {status: 200})
  } catch (error) {
    console.error("Error handling signup request:", error);
    return new NextResponse("Internal Server Error", {status: 500})
  }
};
