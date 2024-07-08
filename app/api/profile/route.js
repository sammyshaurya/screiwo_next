// pages/api/profile
import { verifyUser, userProfile } from '@/app/api/middleware/fetchData';
import { NextResponse } from 'next/server';
import { connectdb } from '@/app/lib/db';
import { user } from '@nextui-org/theme';

export const GET = async (req,res) => {
    await connectdb();
    await verifyUser(req,res);
    if (!req.verified) {
        return NextResponse.json("Unauthorized access", { status: 401 });
      }
    await userProfile(req,res);
    const userprofile = {profile : req.profile, user: req.user}
    if (!userprofile.profile || !userprofile.user){
        return new NextResponse("Internal error, no user found", {status: 404})
    }
    return NextResponse.json(userprofile, { status: 200 });
}