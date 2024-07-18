import { NextResponse } from 'next/server';
import { connectdb } from '@/app/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { userProfile } from '../middleware/fetchData';

export const GET = async (req,res) => {
    await connectdb();
    const user = await currentUser();
    if (!user) {
        return NextResponse.json("Unauthorized access", { status: 401 });
      }
    await userProfile(req,res);
    const userprofile = {profile : req.profile}
    if (!userprofile.profile){
        return new NextResponse("Internal error, no user found", {status: 404})
    }
    return NextResponse.json(userprofile, { status: 200 });
}