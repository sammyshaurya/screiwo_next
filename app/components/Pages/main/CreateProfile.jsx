'use client'
import React, { useState } from "react";
import { ProfileNav } from "./ProfileNav";
import { DatePicker } from "antd";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import axios from "axios";
import Image from "next/image";
import { useRouter } from 'next/navigation';

const CreateProfile = () => {
    const [profileData, setProfileData] = useState({
        profileType: "Personal",
        gender: "Male",
        dob: "",
        mobile: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const Router = useRouter();

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleDobChange = (dob, dateString) => {
        setProfileData({ ...profileData, dob: dateString });
    };

    const validateMobile = (mobile) => {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobile);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!profileData.profileType || !profileData.gender || !profileData.dob || !profileData.mobile) {
            setError("Please fill all the fields");
            return;
        }

        if (!validateMobile(profileData.mobile)) {
            setError("Please enter a valid mobile number");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/profile/createprofile', { profileData, token });
            // alert("Profile created successfully!");
            return Router.push('/profile');
        } catch (error) {
            console.error(error);
            setError("Failed to create profile. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ProfileNav />
            <div className="flex flex-col border w-11/12 mx-auto my-4 p-8 rounded-lg md:w-8/12 lg:w-7/12 xl:w-6/12">
                <div className="flex items-center mb-8">
                    <Image
                        className="w-20 h-20 rounded-full bg-gray-500 mr-4"
                        src="/avatar.png"
                        alt="Profile"
                    />
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                        Setup profile details
                    </h2>
                </div>
                <div className="flex flex-col">
                    <div className="mb-4">
                        <label
                            htmlFor="profileType"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Profile type:
                        </label>
                        <select
                            id="profileType"
                            name="profileType"
                            value={profileData.profileType}
                            onChange={handleChange}
                            className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option value="Personal">Personal</option>
                            <option value="Professional">Professional</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Gender:
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={profileData.gender}
                            onChange={handleChange}
                            className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="dob"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Date of Birth:
                        </label>
                        <DatePicker
                            id="dob"
                            name="dob"
                            value={profileData.dob}
                            onChange={handleDobChange}
                            picker="date"
                            className="mt-1 w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="mobile"
                            className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Mobile Number:
                        </label>
                        <Input
                            id="mobile"
                            name="mobile"
                            value={profileData.mobile}
                            onChange={handleChange}
                            className="mt-1 w-full"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <Button onClick={submit} className="w-full" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>
        </>
    );
};

export default CreateProfile;
