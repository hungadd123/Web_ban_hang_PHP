// src/components/ProductItem.jsx
import React from "react";
import { TbPencil, TbTrash } from "react-icons/tb";

const ProductItem = ({ product, currency, onEdit, onDelete }) => {
  return (
    <div className="border p-4 rounded-lg relative">
      <h4 className="bold-18 mb-1">{product.name}</h4>
      <p className="medium-15 text-secondary">
        {currency}{product.price}.00
      </p>
      <p className="text-gray-600 mb-3">{product.description}</p>
      <div className="flex gap-2">
        <button onClick={() => onEdit(product)} className="btn-secondary rounded px-3 py-1 flex items-center gap-1">
          <TbPencil /> Edit
        </button>
        <button onClick={() => onDelete(product._id)} className="btn-white rounded px-3 py-1 text-red-500 flex items-center gap-1">
          <TbTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
