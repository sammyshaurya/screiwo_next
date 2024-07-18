import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req)=>{
    await connectdb();
    const {userId} = auth();
    if(!req.verified){
        return NextResponse.json("Unauthorized access",{status:401});
    }
    const profile = await Profile.findOne({userid:userId}, {FollowingsList:1});
    const usersList = await Profile.find({ userid: { $in: profile.FollowingsList } }, {username:1})
    return NextResponse.json(usersList,{status:200});
}