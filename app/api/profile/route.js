import { NextResponse } from 'next/server';
import { connectdb } from '@/app/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import Profile from '@/app/models/Profile.model';

export const GET = async (req, res) => {
    try {
        await connectdb();
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
        }
        
        const profile = await Profile.findOne({ userid: user.id });
        
        if (!profile) {
            return NextResponse.json({ message: "Profile not found.", valid: false }, { status: 404 });
        }
        
        const userprofile = { profile };
        return NextResponse.json(userprofile, { status: 200 });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}