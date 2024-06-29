import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import Profile from '@/app/models/Profile.model';

export const GET = async (req, res) => {
  await connectdb();
  const query = req.nextUrl.searchParams.get('q') || null;
  if (!query){
    return NextResponse.json("Error fetching users", { status: 400 });
  }
  const limit = parseInt(req.nextUrl.searchParams.get('limit')) || 7;
  const page = parseInt(req.nextUrl.searchParams.get('page')) || 1;
  const skip = (page - 1) * limit;

  try {
    const users = await Profile.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { FirstName: { $regex: query, $options: "i" } },
        { LastName: { $regex: query, $options: "i" } },
      ],
    })
    .skip(skip)
    .limit(limit);

    const searchResult = users.map((user) => ({
      username: user.username,
      userid: user.userid,
    }));

    return NextResponse.json(searchResult, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users", details: error.message }, { status: 400 });
  }
};
