"use client";
import React, { useState } from "react";
import ProfileNav from "../components/Pages/main/ProfileNav";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
        <main className="app-shell max-w-4xl">
          <section className="app-panel overflow-hidden rounded-[28px]">
            <div className="border-b border-slate-800/80 bg-slate-950/70 px-6 py-7 md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Image
                  className="h-20 w-20 rounded-full border border-slate-700/80 bg-slate-900 object-cover"
                  src={
                    clerkUser?.imageUrl ||
                    "https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yajRnVkRFaDFMak1JTzRKcXNWY3drckdZMmEiLCJyaWQiOiJ1c2VyXzJqUDlkb0p2TE9uYmVZOVkxZlUzUEVVYm1wViIsImluaXRpYWxzIjoiVFUifQ?width=160"
                  }
                  width={80}
                  height={80}
                  alt="Profile"
                />
                <div>
                  <p className="app-kicker">Onboarding</p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
                    Setup profile details
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This is the information readers will see when they open your profile. Keep it accurate and polished.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <div>
                  <label htmlFor="profileType" className="mb-2 block text-sm font-medium text-slate-200">
                    Profile type
                  </label>
                  <Select id="profileType" name="profileType" value={profileData.profileType} onChange={handleChange}>
                    <option value="Personal">Personal</option>
                    <option value="Professional">Professional</option>
                  </Select>
                </div>

                <div>
                  <label htmlFor="gender" className="mb-2 block text-sm font-medium text-slate-200">
                    Gender
                  </label>
                  <Select id="gender" name="gender" value={profileData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </div>

                <div>
                  <label htmlFor="dob" className="mb-2 block text-sm font-medium text-slate-200">
                    Date of birth
                  </label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={profileData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="mb-2 block text-sm font-medium text-slate-200">
                    Mobile number
                  </label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleChange}
                    placeholder="Enter 10 digit number"
                  />
                </div>

                {error ? <div className="text-sm font-medium text-red-400">{error}</div> : null}

                <div className="pt-2">
                  <Button onClick={submit} className="app-action-primary w-full justify-center" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>

              <aside className="space-y-4">
                <section className="app-section">
                  <p className="app-kicker">Preview</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Your profile details will appear in your public profile and help readers understand who you are.
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
