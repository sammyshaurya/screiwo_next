import { NextResponse } from "next/server";
import { verifyUser } from "@/app/api/middleware/fetchData";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";

export const GET = async (req)=>{
    await connectdb();
    await verifyUser(req);
    if(!req.verified){
        return NextResponse.json("Unauthorized access",{status:401});
    }
    const profile = await Profile.findOne({userid:req.user._id}, {FollowersList:1});
    const usersList = await Profile.find({ userid: { $in: profile.FollowersList } }, {username:1})
    return NextResponse.json(usersList,{status:200});
}