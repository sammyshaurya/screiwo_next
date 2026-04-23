"use client";
import React, { useState } from "react";
import ProfileNav from "../components/Pages/main/ProfileNav";
import { DatePicker } from "antd";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const CreateProfile = () => {
  const [profileData, setProfileData] = useState({
    profileType: "Personal",
    gender: "Male",
    dob: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const {user: clerkUser} = useUser();

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handledob = async (dob) => {
    setProfileData({ ...profileData, dob: dob });
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !profileData.profileType ||
      !profileData.gender ||
      !profileData.dob ||
      !profileData.mobile
    ) {
      setError("Please fill all the fields");
      return;
    }

    if (!validateMobile(profileData.mobile)) {
      setError("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/profile/createprofile", {
        profileData
      });
      alert("Profile created successfully!");
      return router.push("/profile");
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
      <div className="app-page">
        <main className="app-shell max-w-3xl">
          <section className="app-panel overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-7 md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Image
                  className="h-20 w-20 rounded-full border border-slate-200 bg-slate-100"
                  src={clerkUser?.imageUrl || "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yajRnVkRFaDFMak1JTzRKcXNWY3drckdZMmEiLCJyaWQiOiJ1c2VyXzJqUDlkb0p2TE9uYmVZOVkxZlUzUEVVYm1wViIsImluaXRpYWxzIjoiVFUifQ?width=160"}
                  width={80}
                  height={80}
                  alt="Profile"
                />
                <div>
                  <p className="app-kicker">Onboarding</p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                    Setup profile details
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex flex-col">
                <div className="mb-4">
                  <label
                    htmlFor="profileType"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Profile type:
                  </label>
                  <select
                    id="profileType"
                    name="profileType"
                    value={profileData.profileType}
                    onChange={handleChange}
                    className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Gender:
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Date of Birth:
                  </label>
                  <DatePicker
                    id="dob"
                    onChange={(date, dateString) => handledob(dateString)}
                    name="dob"
                    type="dob"
                    picker="date"
                    className="mt-1 w-full"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-slate-900"
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

                {error && <div className="mb-4 text-red-500">{error}</div>}

                <div className="mt-8">
                  <Button
                    onClick={submit}
                    className="app-action-primary w-full justify-center"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>

              <aside className="space-y-4">
                <section className="app-section">
                  <p className="app-kicker">Preview</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    This is the information readers will see when they open your profile. Keep it accurate and polished.
                  </p>
                </section>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default CreateProfile;
