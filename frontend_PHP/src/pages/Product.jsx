import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import {
  FaCheck,
  FaHeart,
  FaStar,
  FaStarHalfStroke,
  FaTruckFast,
} from "react-icons/fa6";
import { TbShoppingBagPlus, TbMapPin } from "react-icons/tb";
import ProductDescription from "../components/ProductDescription";
import ProductFeatures from "../components/ProductFeatures";
import RelatedProducts from "../components/RelatedProducts";
import Footer from "../components/Footer";
import ReviewList from "../components/ReviewList";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const { backendUrl, token } = useContext(ShopContext);

  const fetchProductData = () => {
    const selectedProduct = products.find((item) => item._id === productId);
    if (selectedProduct) {
      // --- COLOR FIX (within fetchProductData) ---
      const cleanedColors = selectedProduct.colors
        ? selectedProduct.colors.map((color) => color.replace(/['"]+/g, ""))
        : []; // Handle potential undefined/null

      setProduct({ ...selectedProduct, colors: cleanedColors }); // Update with cleaned colors
      setMainImage(selectedProduct.image[0]);
      // Pre-select the first *cleaned* color if available
      if (cleanedColors.length > 0) {
        setSelectedColor(cleanedColors[0]);
      }
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  useEffect(() => {
    if (product && product.storeId) {
      axios
        .get(`${backendUrl}/api/store/single?storeId=${product.storeId._id}`)
        .then((response) => {
          if (response.data.success) {
            setStoreInfo(response.data.store);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [product, backendUrl]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* --- PRODUCT DATA --- */}
        <div className="flex flex-col lg:flex-row gap-10 rounded-2xl p-3 mb-6 bg-white shadow-md">
          {/* --- IMAGE SECTION --- */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            {/* Main Image with Hover Zoom */}
            <div className="relative w-full aspect-video border rounded-lg overflow-hidden group"> {/* Changed aspect-w-1 aspect-h-1 to aspect-video */}
              <img
                src={mainImage}
                alt={`Product: ${product.name}`}
                className="w-full h-full object-fit object-center transition duration-300 ease-in-out transform group-hover:scale-110"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 flex-wrap">
              {product.image.map((img, i) => (
                <button
                  key={i}
                  className={`w-16 h-16 border rounded overflow-hidden transition duration-200 ease-in-out ${
                    img === mainImage
                      ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-75"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setMainImage(img)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1} of ${product.name}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* --- PRODUCT INFO SECTION --- */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 bg-white rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            {/* --- RATING --- */}
            <div className="flex items-center gap-x-2 mt-2">
              <div className="flex items-center gap-x-1 text-yellow-400">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalfStroke />
              </div>
              <span className="text-sm text-gray-500">(123 reviews)</span>
            </div>

            {/* --- PRICE --- */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-3">
              {currency}
              {product.price.toFixed(2)}
            </h2>

            {/* --- DESCRIPTION --- */}
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* --- COLOR OPTIONS --- */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">
                  Choose a color:
                </h3>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((col, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition duration-200 ease-in-out ${
                        selectedColor === col
                          ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-75"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      title={col}
                      aria-label={`Select color: ${col}`}
                    >
                      {selectedColor === col && (
                        <FaCheck
                          className={
                            col.toLowerCase() === "white"
                              ? "text-black"
                              : "text-white"
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- ACTION BUTTONS --- */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => addToCart(product._id, selectedColor)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-black text-white font-semibold text-base transition duration-300 ease-in-out flex items-center justify-center gap-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <TbShoppingBagPlus className="text-lg" />
                Add to Cart
              </button>
              <button
                className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                <FaHeart className="text-lg" />
                <span className="sr-only">Add to Wishlist</span>
              </button>
            </div>

            {/* --- DELIVERY INFO --- */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-x-2">
                <FaTruckFast className="text-xl text-gray-500" />
                <span className="text-sm text-gray-600">
                  Free Delivery on orders over {currency}500.00
                </span>
              </div>
            </div>

            {/* --- ADDITIONAL INFO --- */}
            <div className="mt-4 text-sm text-gray-500 space-y-2">
              <p>✓ Authenticity Guaranteed</p>
              <p>✓ Cash on Delivery Available</p>
              <p>✓ Easy 7-Day Returns</p>
            </div>
          </div>
        </div>

        {/* --- SELLER INFORMATION --- */}
        {storeInfo && (
          <section className="mt-12 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Seller Information</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={storeInfo.storeLogo}
                alt={`Logo of ${storeInfo.storeName}`}
                className="w-16 h-16 rounded-full object-cover object-center ring-2 ring-gray-300"
              />
              <div>
                <h3 className="text-lg font-semibold">{storeInfo.storeName}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <TbMapPin className="text-gray-500" />
                  <span className="text-gray-600">{storeInfo.storeAddress}</span>
                </div>
                <Link
                  to={`/store/${storeInfo._id}`}
                  className="mt-3 inline-block px-4 py-2 bg-black text-white rounded-md text-sm font-medium transition duration-300 ease-in-out"
                >
                  Visit Store
                </Link>
              </div>
            </div>
          </section>
        )}

        <ReviewList
          productId={productId}
          backendUrl={backendUrl}
          token={token}
        />
        <RelatedProducts category={product.category} />
      </div>
      <Footer />
    </div>
  );
};

export default Product;