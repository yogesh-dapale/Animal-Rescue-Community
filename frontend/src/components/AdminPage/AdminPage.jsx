import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../AxiosInstance";
import store from "../../Store/Store";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [adoptions, setAdoptions] = useState([]); // State for adoption requests
  const [animals, setAnimals] = useState([]); // State for all animals
  const [imageSrcs, setImageSrcs] = useState({});
  const [loadingAdoptions, setLoadingAdoptions] = useState(true);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const state = store.getState();
  const token = state.auth.jwtToken;
  const navigate = useNavigate();

  // Filter animals by category
  const filteredAnimals = animals.filter((animal) =>
    selectedCategory === "all" ? true : animal.category === selectedCategory
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnimals = filteredAnimals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);

  // Fetch all pending adoption requests
  const fetchAdoptions = useCallback(async () => {
    setLoadingAdoptions(true);
    try {
      const response = await axiosInstance.get("/api/adoptions");
      setAdoptions(
        response.data.filter((adoption) => adoption.status === "PENDING")
      );
    } catch (error) {
      console.error("Error fetching adoption requests:", error);
    } finally {
      setLoadingAdoptions(false);
    }
  }, []);

  // Fetch all animals from the backend
  const fetchAllAnimals = useCallback(async () => {
    setLoadingAnimals(true);
    try {
      const response = await axiosInstance.get("/api/animals");
      setAnimals(response.data);
    } catch (error) {
      console.error("Error fetching all animals:", error);
    } finally {
      setLoadingAnimals(false);
    }
  }, []);

  // Fetch images for animals
  const fetchImage = async (animalId, photoURL) => {
    setLoadingImages(true);
    try {
      const response = await axios.get(photoURL, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = URL.createObjectURL(response.data);
      setImageSrcs((prev) => ({ ...prev, [animalId]: url }));
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAdoptions();
    fetchAllAnimals();
  }, [fetchAdoptions, fetchAllAnimals]);

  // Fetch images for all animals
  useEffect(() => {
    const fetchImagesForAnimals = async () => {
      for (const animal of animals) {
        if (animal.photo && animal.photo !== "null") {
          await fetchImage(animal.id, animal.photoURL);
        }
      }
    };

    fetchImagesForAnimals();
  }, [animals, token]);

  // Handle approving an adoption request
  const handleApprove = async (animalId) => {
    try {
      setProcessingId(animalId);
      setAnimationType("approve");

      const adoptionDTO = adoptions.find((a) => a.animalId.id === animalId);
      const animalDTO = animals.find((a) => a.id === animalId);

      adoptionDTO.status = "APPROVED";
      animalDTO.status = "ADOPTED";

      const formData = new FormData();
      formData.append("adoptionDTO", JSON.stringify(adoptionDTO));
      formData.append("animalDTO", JSON.stringify(animalDTO));

      await axiosInstance.put(`/api/adoptions/${adoptionDTO.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTimeout(() => {
        setAdoptions((prev) => prev.filter((adoption) => adoption.animalId.id !== animalId));
        setAnimals((prev) => prev.filter((animal) => animal.id !== animalId));
        setProcessingId(null);
        setAnimationType(null);
      }, 2000);
    } catch (error) {
      console.error("Approval error:", error);
      setProcessingId(null);
      setAnimationType(null);
    }
  };

  // Handle rejecting an adoption request
  const handleReject = async (animalId) => {
    try {
      setProcessingId(animalId);
      setAnimationType("reject");

      const adoptionDTO = adoptions.find((a) => a.animalId.id === animalId);

      const formData = new FormData();
      formData.append("adoptionDTO", new Blob([JSON.stringify({
        id: adoptionDTO.id,
        status: "REJECTED",
      })], { type: "application/json" }));

      await axiosInstance.put(`/api/adoptions/${adoptionDTO.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTimeout(() => {
        setAdoptions((prev) => prev.filter((adoption) => adoption.animalId.id !== animalId));
        setAnimals((prev) => prev.filter((animal) => animal.id !== animalId));
        setProcessingId(null);
        setAnimationType(null);
      }, 2000);
    } catch (error) {
      console.error("Rejection error:", error);
      setProcessingId(null);
      setAnimationType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes confetti {
          0% { background-position: 0 0, 0 0, 0 0; }
          30% { background-position: -200% 100%, 100% 100%, 100% 100%; }
          100% { background-position: -200% 100%, 100% 100%, 100% 100%; }
        }

        .animate-pop-in {
          animation: popIn 0.6s ease-out forwards;
        }

        .approved-message {
          position: relative;
          overflow: hidden;
        }

        .approved-message::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background-image: 
            linear-gradient(45deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(72, 187, 120, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(72, 187, 120, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(72, 187, 120, 0.1) 75%);
          background-size: 20px 20px;
          animation: confetti 2s linear infinite;
        }
      `}</style>

      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>

        {/* Adoption Requests Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Adoption Requests</h2>
          {loadingAdoptions || loadingAnimals || loadingImages ? (
            <div className="flex justify-center items-center mb-4">
              <img src="/Running dog.gif" alt="Loading" className="w-32 h-32" />
            </div>
          ) : (
            <>
              {adoptions.map((adoption) => (
                <div
                  key={adoption.id}
                  className={`flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg transition-all duration-300 ${
                    processingId === adoption.animalId.id ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={imageSrcs[adoption.animalId.id] || "/default-animal.jpg"}
                      alt={adoption.animalId.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold">{adoption.animalId.name}</p>
                      <p className="text-gray-600">
                        {adoption.animalId.category && `Species: ${adoption.animalId.category} • `}
                        Age: {adoption.animalId.age} • Gender: {adoption.animalId.gender}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {processingId === adoption.animalId.id ? (
                      animationType === "approve" ? (
                        <div className="bg-green-100 px-6 py-3 rounded-lg border border-green-200 flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-700 font-semibold">
                            Pet Adoption Approved
                          </span>
                        </div>
                      ) : (
                        <div className="bg-red-100 px-6 py-3 rounded-lg border border-red-200 flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-red-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-red-700 font-semibold">
                            Adoption Request Rejected
                          </span>
                        </div>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(adoption.animalId.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(adoption.animalId.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* List of All Animals Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">All Animals</h2>
          {loadingAnimals || loadingImages ? (
            <div className="flex justify-center items-center mb-4">
              <img src="/Running dog.gif" alt="Loading" className="w-32 h-32" />
            </div>
          ) : (
            <>
              {currentAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="flex items-center justify-between p-4 mb-4 bg-gray-100 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={imageSrcs[animal.id] || "/default-animal.jpg"}
                      alt={animal.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold">{animal.name}</p>
                      <p className="text-gray-600">
                        {animal.category && `Species: ${animal.category} • `}
                        Age: {animal.age} • Gender: {animal.gender}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="mx-1 px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`mx-1 px-4 py-2 rounded transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="mx-1 px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
          {!loadingAnimals && filteredAnimals.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-8">
              No animals found in this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;