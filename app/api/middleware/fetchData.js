// middleware/fetchData.js
import Profile from "@/app/models/Profile.model";
import { NextResponse } from 'next/server';
import { connectdb } from "@/app/lib/db";
import { currentUser } from '@clerk/nextjs/server';

/**
 * Middleware to fetch current user's profile from Clerk
 * Clerk authentication is now the single source of truth
 */
export const userProfile = async (req, res, next) => {
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
        req.profile = profile;
        return true;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
