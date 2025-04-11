import React, { useState } from "react";

const ReviewModal = ({ product, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = () => {
    if (rating === 0 || reviewText.trim() === "") {
      alert("Please provide a rating and review.");
      return;
    }
    onSubmit(product._id, rating, reviewText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Rate & Review</h3>
        <p className="mb-2">Product: <span className="font-bold">{product.name}</span></p>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Rating (1-5):</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="0">Select rating</option>
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write your review here..."
          ></textarea>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="btn-white px-3 py-1 rounded shadow">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-secondary px-3 py-1 rounded shadow">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
