import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa"; // Import star icons

const ReviewList = ({ productId, backendUrl, token }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5); // Number of reviews per page
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);    // Add error state


  const fetchReviews = async () => {
    setLoading(true); // Set loading to true when fetching
    setError(null); // Clear any previous errors
    try {
      const response = await axios.get(
        `${backendUrl}/api/review/product/${productId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
          setError(response.data.message || "Failed to fetch reviews."); // Set error message

      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to fetch reviews. Please try again later."); // Set user-friendly error
    } finally {
        setLoading(false); // Set loading to false after fetch completes (success or failure)
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, backendUrl, token]);


    // Function to render star rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} className="text-yellow-400" />); // Filled star
            } else if (i - 0.5 === rating) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />); // Half star
            } else {
                stars.push(<FaRegStar key={i} className="text-yellow-400" />); // Empty star
            }
        }
        return stars;
    };


  // Get current reviews (for pagination)
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <p className="text-gray-500 text-center">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>;
  }


  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="space-y-6">
        {currentReviews.map((review) => (
          <div
            key={review._id}
            className="border rounded-lg p-4 bg-white shadow"
            role="listitem"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">
                  {review.userId ? `User ${review.userId.substring(0,6)}...` : "Anonymous User"}
                </p>
                <div className="flex items-center" aria-label={`Rating: ${review.rating} out of 5`}>
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(review.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>

       {/* Pagination */}
       {reviews.length > reviewsPerPage && (
        <nav className="flex justify-center mt-8">
          <ul className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }).map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-full transition duration-200 ease-in-out ${
                    currentPage === index + 1
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
};

export default ReviewList;