// middleware/fetchData.js
import User from "@/app/models/User.model.js";
import Profile from "@/app/models/Profile.model";
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'
import { connectdb } from "@/app/lib/db";

export const verifyUser = async (req, res, tokens=null) => {
    await connectdb()
    const tokenVal = tokens
    let token = headers().get('authorizations') || headers().get('authorization') || tokenVal;
    try {
        if (!token) {
            req.verified = false;
            return NextResponse.json({ message: "Access denied. No token provided." }, { status: 401 });
        }

        const user = await User.findOne({ token });

        if (!user) {
            req.verified = false;
            return NextResponse.json({ message: "Invalid User.", valid: false }, { status: 401 });
        }

        const { password, ...userData } = user.toObject();
        req.user = userData;
        req.verified = true;
        return true;
    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
        }

        const profile = await Profile.findOne({ userid: user._id });

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