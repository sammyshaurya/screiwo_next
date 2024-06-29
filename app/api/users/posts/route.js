import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";

export const GET = async (req,res)=> {
    await verifyUser(req, res);
    const userId = req.user._id.toString();
    try {
        const profile = await Profile.findOne({ userid: userId });
        
        if (!profile) {
            return NextResponse.json("Profile not found", {status: 400})
        }
  
        const userPosts = profile.posts;
        
        return NextResponse.json({userPosts}, {status: 200})
    } catch (error) {
        console.error("Error fetching posts:", error);
        return new NextResponse("Internal server error", {status: 500})
    }
}