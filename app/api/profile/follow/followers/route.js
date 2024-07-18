import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";

export const GET = async (req)=>{
    await connectdb();
    const {userId} = auth();
    if(!signeduser){
        return NextResponse.json("Unauthorized access",{status:401});
    }
    const profile = await Profile.findOne({userid:userId}, {FollowersList:1});
    const usersList = await Profile.find({ userid: { $in: profile.FollowersList } }, {username:1})
    return NextResponse.json(usersList,{status:200});
}