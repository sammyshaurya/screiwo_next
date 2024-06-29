import { NextResponse } from "next/server"
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";

export const GET = async (req,{params})=> {
  await connectdb();
    try {
      const { searchParams } = new URL(req.url)
      const user = req.nextUrl.searchParams.get('username') || null;
        if (!user){
            console.error('No username provided');
            return NextResponse.json("Error", { status: 401 });
          }
        const searchedUsers = await Profile.findOne({ username: user });
        return NextResponse.json({userProfile: searchedUsers}, {status: 200})
      } catch (error) {
        console.error('Error searching for users:', error);
        return NextResponse("Internal Server Error", {status: 500})
      }
}