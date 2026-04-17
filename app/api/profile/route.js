import { NextResponse } from 'next/server';
import { connectdb } from '@/app/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import Profile from '@/app/models/Profile.model';
import { getPostsByAuthorId } from '@/app/lib/postData';
import Posts from '@/app/models/Posts.model';
import { syncProfileCounters, withLiveProfileCounts } from '@/app/lib/profileData';

function normalizeString(value) {
    return typeof value === "string" ? value.trim() : value;
}

export const GET = async (req, res) => {
    try {
        await connectdb();
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
        }
        
        const profile = await Profile.findOne({ userid: user.id }).lean();
        
        if (!profile) {
            return NextResponse.json({ message: "Profile not found.", valid: false }, { status: 404 });
        }
        
        const posts = await getPostsByAuthorId(user.id);
        const userprofile = { profile: withLiveProfileCounts(profile, posts.length), posts };
        return NextResponse.json(userprofile, {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}

export const PATCH = async (req) => {
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

        const body = await req.json();
        const profileData = body.profileData || {};
        const settings = body.settings || {};

        const nextUsername = normalizeString(profileData.username);
        if (nextUsername && nextUsername !== profile.username) {
            const usernameExists = await Profile.findOne({
                username: nextUsername,
                userid: { $ne: user.id },
            }).lean();

            if (usernameExists) {
                return NextResponse.json(
                    { message: "Username already taken." },
                    { status: 409 }
                );
            }
        }

        const profileFields = [
            "username",
            "FirstName",
            "LastName",
            "Bio",
            "website",
            "location",
            "profileType",
            "gender",
            "dob",
            "mobile",
            "profileImageUrl",
        ];

        profileFields.forEach((field) => {
            if (profileData[field] !== undefined) {
                profile[field] = normalizeString(profileData[field]);
            }
        });

        if (profileData.preferences && typeof profileData.preferences === "object") {
            profile.preferences = {
                ...(profile.preferences || {}),
                ...profileData.preferences,
            };
        }

        if (settings && typeof settings === "object") {
            profile.preferences = {
                ...(profile.preferences || {}),
                ...settings,
            };
        }

        await profile.save();

        await Posts.updateMany(
            { userid: user.id },
            {
                $set: {
                    username: profile.username,
                    profileImageUrl: profile.profileImageUrl,
                },
            }
        );

        await syncProfileCounters(user.id);
        const updatedProfile = await Profile.findOne({ userid: user.id }).lean();

        return NextResponse.json(
            {
                message: "Profile updated successfully.",
                profile: withLiveProfileCounts(updatedProfile),
                previousUsername: profile.username,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
                error: error.message,
            },
            { status: 500 }
        );
    }
};
