import { useState } from 'react';
import axiosInstance from '../../AxiosInstance';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNo: '', // Changed from 'tel' to match backend DTO
        location: '',
    });

    const [submittedData, setSubmittedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phoneNo || !formData.location) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.post('http://localhost:8080/api/contacts', formData);
            setSubmittedData(response.data);
            setFormData({ name: '', email: '', phoneNo: '', location: '' });
        } catch (err) {
            setError('Error submitting the form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch live location
    const fetchLiveLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData({
                        ...formData,
                        location: `${latitude}, ${longitude}`,
                    });
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    alert('Unable to fetch your location. Please enter it manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="relative flex items-top justify-center bg-white sm:items-center sm:pt-0 min-h-screen">
            <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <div className="mt-8 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left Contact Info Section */}
                        <div className="p-6 mr-2 bg-gray-100 sm:rounded-lg">
                            <h1 className="text-3xl sm:text-4xl text-gray-800 font-extrabold tracking-tight">
                                Get in touch:
                            </h1>
                            <p className="text-lg sm:text-xl font-medium text-gray-600 mt-2">
                                Fill in the form to start a conversation
                            </p>

                            <div className="mt-8 space-y-4">
                                <p className="text-gray-600 text-lg font-semibold">📍 Pune, pASHAN</p>
                                <p className="text-gray-600 text-lg font-semibold">📞 +91 7875651700</p>
                                <p className="text-gray-600 text-lg font-semibold">📧 arc@gmail.com</p>
                            </div>
                        </div>

                        {/* Right Form Section */}
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col justify-center bg-white shadow-lg rounded-lg">
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="Full Name" 
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                            />

                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="Email" 
                                className="w-full mt-4 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                            />

                            <input 
                                type="tel" 
                                name="phoneNo" 
                                value={formData.phoneNo} 
                                onChange={handleChange} 
                                placeholder="Phone Number" 
                                className="w-full mt-4 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                            />

                            <div className="flex items-center mt-4">
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    placeholder="Location" 
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                />
                                <button 
                                    type="button" 
                                    onClick={fetchLiveLocation} 
                                    className="ml-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                    📍Live Location
                                </button>
                            </div>

                            {error && <p className="text-red-500 mt-2">{error}</p>}

                            <button 
                                type="submit" 
                                className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg mt-6 transition-transform duration-300 hover:scale-105 hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Display Submitted Data */}
            {submittedData && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full transform transition-transform duration-300 hover:scale-105">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Submitted Data</h2>
                        <p><strong>Name:</strong> {submittedData.name}</p>
                        <p><strong>Email:</strong> {submittedData.email}</p>
                        <p><strong>Phone:</strong> {submittedData.phoneNo}</p>
                        <p><strong>Location:</strong> {submittedData.location}</p>
                        <button 
                            onClick={() => setSubmittedData(null)} 
                            className="w-full bg-blue-500 text-white py-2 rounded-lg mt-6 hover:bg-blue-600 transition duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}