import React, { useState } from "react";
import axios from "axios";
import ReviewModal from "./ReviewModal";
import ReviewList from "./ReviewList";

const OrderDetail = ({ order, backendUrl, token, currency }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [localReviews, setLocalReviews] = useState({}); // lưu review theo product id

  const handleReceived = (product) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (productId, rating, reviewText) => {
    try {
      // Gọi API submit review
      const response = await axios.post(
        `${backendUrl}/api/review/submit`,
        { productId, rating, reviewText },
        { headers: { token } }
      );
      if (response.data.success) {
        setLocalReviews((prev) => ({
          ...prev,
          [productId]: { rating, reviewText },
        }));
        setShowReviewModal(false);
      } else {
        alert("Review submission failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Review submission error: " + error.message);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Order Detail</h2>
      <p className="mb-2"><strong>Order ID:</strong> {order._id}</p>
      <p className="mb-2">
        <strong>Date:</strong> {new Date(order.date).toLocaleString()}
      </p>
      <p className="mb-4"><strong>Status:</strong> {order.status}</p>
      <div>
        <h3 className="text-xl font-bold mb-2">Items:</h3>
        {order.items.map((item) => (
          <div key={item._id} className="border p-4 mb-4 rounded flex gap-4">
            <img
              src={item.image[0]}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-bold text-lg">{item.name}</p>
              <p className="text-sm">Quantity: {item.quantity}</p>
              <p className="text-sm">Color: {item.color}</p>
              <p className="text-sm">Price: {currency}{item.price}</p>
              {/* Nếu chưa review, hiển thị nút nhận hàng */}
              {!localReviews[item._id] && (
                <button
                  onClick={() => handleReceived(item)}
                  className="mt-2 btn-secondary"
                >
                  Đã nhận được hàng
                </button>
              )}
              {/* Hiển thị review từ local state nếu có */}
              {localReviews[item._id] && (
                <div className="mt-2 p-2 border-t">
                  <p className="text-sm">
                    <strong>Rating:</strong> {localReviews[item._id].rating} / 5
                  </p>
                  <p className="text-sm">
                    <strong>Review:</strong> {localReviews[item._id].reviewText}
                  </p>
                </div>
              )}
              {/* Hiển thị danh sách review từ API */}
              <ReviewList productId={item._id} backendUrl={backendUrl} token={token} />
            </div>
          </div>
        ))}
      </div>
      {showReviewModal && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default OrderDetail;
