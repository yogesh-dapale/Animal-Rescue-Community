import { useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import { State, City } from "country-state-city";
import axiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";

function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const signInWithGoogle = () => {
    setErrors({}); // Clear any existing errors
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const signInWithGithub = () => {
    setErrors({}); // Clear any existing errors
    window.location.href = `${backendUrl}/oauth2/authorization/github`;
  };

  const validate = () => {
    let formErrors = {};

    if (!name) {
      formErrors.name = "Name is required.";
    } else if (name.length > 30) {
      formErrors.name = "Name should be less than 30 characters.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      formErrors.email = "Email is required.";
    } else if (!email.match(emailPattern) || !email.endsWith(".com")) {
      formErrors.email = "Please enter a valid email address.";
    }

    if (!mobile) {
      formErrors.mobile = "Mobile number is required.";
    } else if (mobile.length !== 10) {
      formErrors.mobile = "Mobile number should be exactly 10 digits.";
    }

    const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      formErrors.password = "Password is required.";
    } else if (!password.match(passPattern)) {
      formErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    } else if (password !== confirmPassword) {
      formErrors.password = "Passwords do not match.";
    }

    if (address.trim().length === 0) {
      formErrors.address = "Address is required.";
    }

    if (!selectedState) {
      formErrors.state = "State is required.";
    }

    if (!selectedCity) {
      formErrors.city = "City is required.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const response = await axiosInstance.post(
          "/auth/sign-up",
          {
            name,
            email,
            phoneNo: mobile,
            password,
            address: `${address}, ${selectedCity?.label}, ${selectedState?.label}`,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setSuccessMessage("Registration successful! Please log in.");
          // Reset form data
          setName("");
          setEmail("");
          setMobile("");
          setPassword("");
          setConfirmPassword("");
          setAddress("");
          setSelectedState(null);
          setSelectedCity(null);

          navigate("/login");
        } else {
          // If the response is not successful, log the error data
          const errorData = response.data;
          console.log("API Error Response:", errorData); // Log the response error data
          setErrors({
            apiError: errorData.message || "Registration failed. Please try again.",
          });
        }
      } catch (error) {
        // Enhanced error handling to log specific cases
        console.error("Error during axios request:", error); // Log the error object itself
        if (error.response) {
          // Server responded with an error code (e.g., 400, 500)
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);
          setErrors({
            apiError: error.response.data.message || "Server error. Please try again.",
          });
        } else if (error.request) {
          // Request was made but no response received
          console.error("No response received:", error.request);
          setErrors({
            apiError: "No response from server. Please check your network connection.",
          });
        } else {
          // Other errors (like invalid setup or missing fields)
          console.error("Error setting up request:", error.message);
          setErrors({
            apiError: "An error occurred while setting up the request. Please try again.",
          });
        }
      }
    }
  };

  const stateOptions = State.getStatesOfCountry("IN").map((state) => ({
    label: state.name,
    value: state.isoCode,
  }));

  const cityOptions = selectedState
    ? City.getCitiesOfState("IN", selectedState?.value).map((city) => ({
        label: city.name,
        value: city.name,
      }))
    : [];

  return (
    <div className="relative w-full h-screen items-center justify-center min-h-screen bg-gray-400 font-sans overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
      >
        <source src="./HomeImages/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 flex justify-center items-center min-h-screen bg-opacity-50 bg-gray-400 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md bg-opacity-50">
          <h1 className="text-2xl font-bold mb-4 mt-0">Create New Account</h1>

          <div className="flex justify-between mb-6">
            <button
              className="flex items-center justify-center px-4 py-2 bg-blue-400 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 mr-2"
              onClick={signInWithGoogle}
            >
              <img
                src="/LoginImages/google-brands-solid.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </button>

            <button
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ml-2"
              onClick={signInWithGithub}
            >
              <img
                src="/LoginImages/github-brands-solid.svg"
                alt="GitHub"
                className="w-5 h-5 mr-2"
              />
              Sign in with GitHub
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-1"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="mb-2">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="mb-2">
              <label
                htmlFor="mobile"
                className="block text-gray-700 font-bold mb-1"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm">{errors.mobile}</p>
              )}
            </div>

            <div className="mb-2">
              <label
                htmlFor="address"
                className="block text-gray-700 font-bold mb-1"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>

            <div className="flex space-x-4 mb-2">
              <div className="w-1/2">
                <label
                  htmlFor="state"
                  className="block text-gray-700 font-bold mb-1"
                >
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  id="state"
                  options={stateOptions}
                  value={selectedState}
                  onChange={(option) => {
                    setSelectedState(option);
                    setSelectedCity(null);
                  }}
                  className="w-full"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state}</p>
                )}
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="city"
                  className="block text-gray-700 font-bold mb-1"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <Select
                  id="city"
                  options={cityOptions}
                  value={selectedCity}
                  onChange={(option) => setSelectedCity(option)}
                  className="w-full"
                  isDisabled={!selectedState}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-2">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-bold mb-1"
              >
                Re-enter Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-500 p-2 rounded-md focus:outline-none focus:border-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="mb-4">
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
              >
                Register
              </button>
            </div>
          </form>

          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}
          {errors.apiError && (
            <p className="text-red-500 text-sm">{errors.apiError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
