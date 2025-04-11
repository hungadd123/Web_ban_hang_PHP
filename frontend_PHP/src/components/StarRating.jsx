// src/components/admin/StarRating.jsx
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Dùng react-icons cho tiện

const StarRating = ({ rating, maxRating = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = maxRating - fullStars - halfStar;

  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="w-4 h-4" />
      ))}
      {halfStar === 1 && <FaStarHalfAlt key="half" className="w-4 h-4" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="w-4 h-4" />
      ))}
       {/* Optional: Hiển thị số rating bên cạnh */}
       {/* <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span> */}
    </div>
  );
};

export default StarRating;