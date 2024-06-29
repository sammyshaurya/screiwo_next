import React from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Signup({ togglemode }) {
  const [formData, setformData] = React.useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  });

  const signup = async (e) => {
    e.preventDefault();
    if (
      formData.email &&
      formData.username &&
      formData.firstname &&
      formData.lastname &&
      formData.password
    ) {
      await axios
        .post("/api/users/signup", formData)
        .then((res) => {
          const { message } = res.data;
          document.getElementById("check").textContent = message;
        })
        .catch((err) => {
          document.getElementById("check").textContent = err.response.data;
        });
    } else {
      document.getElementById("check").textContent =
        "Please fill all the fields";
    }
  };

  const handleInputChange = async (event) => {
    setformData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <section className="flex justify-center">
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Create Account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div className="row">
                <div className="col">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Email
                  </label>
                  <input
                    onChange={handleInputChange}
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Email"
                    required=""
                  />
                </div>
                <div className="col">
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Username
                  </label>
                  <input
                    onChange={handleInputChange}
                    type="username"
                    name="username"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Username"
                    required=""
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label
                    htmlFor="FirstName"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    First Name
                  </label>
                  <input
                    onChange={handleInputChange}
                    type="fname"
                    name="firstname"
                    id="fname"
                    placeholder="First Name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required=""
                  />
                </div>
                <div className="col">
                  <label
                    htmlFor="LastName"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Last Name
                  </label>
                  <input
                    onChange={handleInputChange}
                    type="lname"
                    name="lastname"
                    id="lname"
                    placeholder="Last Name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required=""
                  />
                </div>
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
                  required=""
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
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
              <p id="check" className="text-center text-red-500  mt-4"></p>
              <div className="d-grid gap-2 col-10 mx-auto">
                <button
                  onClick={signup}
                  className="btn btn-outline-primary"
                  type="button"
                >
                  Signup
                </button>
              </div>
              <div className="text-sm font-light text-gray-500">
                Login to your account
                <div
                  onClick={togglemode}
                  href="#"
                  className="font-medium text-primary-600 hover:underline"
                >
                  Sign in
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
