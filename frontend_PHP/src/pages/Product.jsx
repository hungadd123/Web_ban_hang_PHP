import React, { useContext, useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, PackageSearch, ArrowRight, Store, AlertCircle, Clock, XCircle, CalendarDays, Hourglass, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "../utils/helpers";


const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart, backendUrl, token } = useContext(ShopContext);
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [storeInfo, setStoreInfo] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const navigate = useNavigate();

    const cleanProductData = useCallback((productData) => {
        if (!productData) return null;
         const thumbnail = productData.thumbnail || '/placeholder-image.png';
         const detailUrls = Array.isArray(productData.image_details) ? productData.image_details.map(detail => detail.imageUrl) : [];
         // Colors are no longer relevant for cart logic, keep for display if needed
         const displayColors = Array.isArray(productData.colors) ? productData.colors.map(c=>String(c).trim().replace(/['"]+/g, '')) : (typeof productData.colors === 'string' ? productData.colors.split(',').map(c=>c.trim().replace(/['"]+/g, '')) : []);

        return {
            ...productData,
            id: productData.id ?? productData._id,
            images: [thumbnail, ...detailUrls],
            colors: displayColors // Keep for display purposes
        };
    }, []);

    const fetchStoreInfo = useCallback(async (storeId) => {
        if (!storeId) {
            setStoreInfo(null);
            return;
        }
        try {
            const response = await axios.get(`${backendUrl}/api/store/findStoreById/${storeId}`);

            if (response.data.success==true && response.data.store) {
                setStoreInfo(response.data.store);
                console.log(storeInfo)
            } else {
                console.warn("Could not fetch store info:", response.data.message);
                setStoreInfo(null);
            }
        } catch (error) {
            console.error("Error fetching store info:", error);
            setStoreInfo(null);
        }
    }, [backendUrl]);

    useEffect(() => {
        if (!productId) {
            toast.error("Invalid Product ID.");
            setLoadingProduct(false);
            navigate('/');
            return;
        }

        setLoadingProduct(true);
        setProduct(null);
        setStoreInfo(null);

        axios.get(`${backendUrl}/api/product/display/${productId}`)
            .then(response => {
                const fetchedProduct = response.data;
                if (fetchedProduct && typeof fetchedProduct === 'object' && (fetchedProduct.id || fetchedProduct._id)) {
                    const cleanedProduct = cleanProductData(fetchedProduct);
                    if (cleanedProduct) {
                        setProduct(cleanedProduct);
                        setMainImage(cleanedProduct.images[0]);
                        // Removed selectedColor state update
                        if (cleanedProduct.store_id) {
                           fetchStoreInfo(cleanedProduct.store_id);
                        }
                    } else {
                        setProduct(null);
                        toast.error("Invalid product data received.");
                    }
                } else {
                    console.error("Product not found or invalid format:", response.data);
                    toast.error("Product not found.");
                    setProduct(null);
                }
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
                toast.error(error.response?.data?.message || "Error fetching product details.");
                setProduct(null);
            })
            .finally(() => {
                setLoadingProduct(false);
            });

    }, [productId, backendUrl, cleanProductData, fetchStoreInfo, navigate]);


    if (loadingProduct) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500"/>
                <p className="ml-2 text-gray-500">Loading Product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                 <PackageSearch className="h-16 w-16 text-muted-foreground mb-4"/>
                 <p className="text-center text-muted-foreground">Product not found or could not be loaded.</p>
                 <Button variant="link" asChild className="mt-4"><Link to="/">Go Home</Link></Button>
                 <Footer/>
             </div>
        );
    }


    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row gap-10 rounded-2xl p-3 mb-6 bg-white shadow-md dark:bg-card dark:border">

                        <div className="flex flex-col gap-4 lg:w-1/2">

                            <div className="relative w-full aspect-square border rounded-lg overflow-hidden group dark:border-border">
                                <img
                                    src={mainImage}
                                    alt={`Product: ${product.productName}`}
                                    className="w-full h-full object-cover object-center transition duration-300 ease-in-out transform group-hover:scale-110"
                                    onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.png'; }}
                                />
                            </div>


                            <div className="flex gap-2 flex-wrap">
                                {product.images && product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`w-16 h-16 border rounded overflow-hidden transition duration-200 ease-in-out dark:border-border ${
                                            img === mainImage
                                                ? "border-primary ring-2 ring-primary ring-offset-1 dark:ring-offset-card"
                                                : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                                        }`}
                                        onClick={() => setMainImage(img)}
                                        aria-label={`View image ${i + 1}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${i + 1} of ${product.productName}`}
                                            className="w-full h-full object-cover object-center"
                                            onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.png'; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 rounded-lg">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {product.productName}
                            </h1>


                            <div className="flex items-center gap-x-2 mt-2">
                                <div className="flex items-center gap-x-1 text-yellow-400">
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStar />
                                    <FaStarHalfStroke />
                                </div>
                                <span className="text-sm text-muted-foreground">(123 reviews)</span>
                            </div>


                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-3">
                                {currency || '₫'}{product.price?.toLocaleString('vi-VN') || '0'} VND
                            </h2>


                            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                                {product.productDetail}
                            </p>


                            {/* Bỏ phần chọn màu */}


                            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                                <Button
                                    onClick={() => addToCart(product.id)} // Chỉ cần productId
                                    size="lg"
                                    className="w-full sm:w-auto"
                                    // Bỏ disabled liên quan đến màu
                                >
                                    <TbShoppingBagPlus className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <Button
                                     variant="outline"
                                     size="icon"
                                     className="w-full sm:w-auto sm:px-3 border-gray-300 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                                     aria-label="Add to Wishlist"
                                >
                                    <FaHeart className="h-5 w-5" />
                                </Button>
                            </div>


                            <div className="mt-6 border-t border-border pt-4">
                                <div className="flex items-center gap-x-2">
                                    <FaTruckFast className="text-xl text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Free Delivery on orders over {currency || '₫'}500,000 VND
                                    </span>
                                </div>
                            </div>


                            <div className="mt-4 text-sm text-muted-foreground space-y-2">
                                <p><FaCheck className="inline mr-1 text-green-600"/> Authenticity Guaranteed</p>
                                <p><FaCheck className="inline mr-1 text-green-600"/> Cash on Delivery Available</p>
                                <p><FaCheck className="inline mr-1 text-green-600"/> Easy 7-Day Returns</p>
                            </div>
                        </div>
                    </div>


                    {storeInfo && (
                        <section className="mt-12 p-6 bg-white dark:bg-card rounded-lg shadow-md border dark:border-border">
                            <h2 className="text-xl font-bold mb-4">Seller Information</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Avatar className="h-16 w-16 border dark:border-border">
                                    <AvatarImage src={storeInfo.avatar || "/default_store_logo.png"} alt={`Logo of ${storeInfo.storeName}`}/>
                                    <AvatarFallback><Store className="h-6 w-6 text-muted-foreground"/></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{storeInfo.storeName}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TbMapPin className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{storeInfo.description || "No description provided"}</span>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="mt-3">
                                        <Link to={`/store/${storeInfo.id}`}>
                                             Visit Store <ArrowRight className="ml-1 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* <ReviewList
                        productId={productId}
                        backendUrl={backendUrl}
                        token={token}
                    /> */}
                     {product.category_id && <RelatedProducts category={product.category_id} />}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Product;