// src/components/ProductCard.jsx (Simplified version)
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProductCard = ({ product }) => {
    const { currency } = useContext(ShopContext);

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md">
            <Link to={`/product/${product.id}`}>
                <img
                    className="p-8 rounded-t-lg h-64 w-full object-cover" // Maintain aspect ratio
                    src={product.image[0]}
                    alt={product.productName}
                />
            </Link>
            <div className="px-5 pb-5">
                <Link to={`/product/${product._id}`}>
                    <h5 className="text-xl font-semibold tracking-tight text-gray-900">
                        {product.productName}
                    </h5>
                </Link>
                <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xl font-bold text-gray-900">
                        {currency === "USD"
                            ? `$${product.price}`
                            : `₫${(product.price * 24000).toLocaleString()}`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;