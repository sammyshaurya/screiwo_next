// signin.jsx
import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Signin = ({ togglemode }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });


  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const login = async (e) => {
    
    e.preventDefault();
    const { username, password } = formData;
    try {
      const res = await axios.get(
        `/api/users/login?username=${username}&password=${password}`
      );
      const { profiled, token } = res.data;
      localStorage.setItem('token', token);
      if (profiled) {
        router.push('/profile');
      } else {
        router.push('/createprofile');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <section className="flex justify-center">
      <div className="mt-16">
        <div className="bg-white rounded-lg shadow sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={login}>
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Username
                </label>
                <input
                  onChange={handleInputChange}
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Username"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  onChange={handleInputChange}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500">
                      Remember me
                    </label>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="d-grid gap-2 col-10 mx-auto">
                <button type="submit" className="btn btn-outline-primary">
                  Login
                </button>
              </div>
              <div className="text-sm font-light text-gray-500">
                Don’t have an account yet?{' '}
                <span
                  onClick={togglemode}
                  className="font-medium text-primary-600 hover:underline cursor-pointer"
                >
                  Sign up
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
