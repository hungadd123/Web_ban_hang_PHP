// src/pages/StorePage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom"; // Không cần Link ở đây trừ khi có link khác
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'; // Import icons
import Item from "../components/Item"; // Component để hiển thị từng sản phẩm
import { toast } from "react-toastify";
import banner from "../assets/banner.jpg"; // Banner mặc định hoặc banner của store
import Footer from "../components/Footer"; // Import Footer

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton cho loading
import { AlertCircle } from "lucide-react"; // Icon cho Alert
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

const StorePage = () => {
    const { storeId } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { followStore, unfollowStore, isFollowingStore, token, backendUrl } = useContext(ShopContext);
    const [isFollowing, setIsFollowing] = useState(null); // null: loading, true: following, false: not following
    const [followLoading, setFollowLoading] = useState(false); // Loading state cho hành động follow/unfollow

    // Fetch store details and products
    useEffect(() => {
        const fetchStoreData = async () => {
            setLoading(true);
            setError(null);
            setIsFollowing(null);
            setFollowLoading(false);
            try {
                const response = await axios.get(`${backendUrl}/api/store/public/${storeId}`);
                if (response.data.success) {
                    setStore(response.data.store);
                    // API /public/:storeId đã trả về products rồi, không cần gọi /api/product/store/:storeId nữa
                    setProducts(response.data.products || []); // Đảm bảo products là mảng
                } else {
                    setError(response.data.message || "Store not found");
                }
            } catch (err) {
                setError(err.response?.data?.message || "An error occurred fetching store data.");
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchStoreData();
        } else {
            setError("Invalid Store ID.");
            setLoading(false);
        }
    }, [storeId, backendUrl]);

    // Check following status when token or store data is available
    useEffect(() => {
        const checkFollowing = async () => {
            // Chỉ kiểm tra khi có token, có storeId và store data đã load xong (để tránh gọi API thừa)
            if (token && storeId && store) {
                setIsFollowing(null); // Bắt đầu trạng thái loading
                try {
                    const following = await isFollowingStore(storeId);
                    setIsFollowing(following);
                } catch (error) {
                    console.error("Error checking follow status:", error);
                    setIsFollowing(false); // Mặc định là false nếu lỗi
                    // toast.error("Could not check follow status.");
                }
            } else {
                 setIsFollowing(false); // Không đăng nhập => không follow
            }
        };

        checkFollowing();
        // Dependency bao gồm cả `store` để đảm bảo check lại nếu store data thay đổi (dù ít khả năng)
    }, [storeId, token, isFollowingStore, store]);

    // Handle follow/unfollow button click
    const handleFollowClick = async () => {
        if (!token) {
            toast.error("Please log in to follow or unfollow a store.");
            return;
        }
        if (isFollowing === null || followLoading) return; // Chặn click khi đang loading

        setFollowLoading(true);
        try {
            let result;
            if (isFollowing) {
                result = await unfollowStore(storeId);
            } else {
                result = await followStore(storeId);
            }
            if (result && result.success) { // Kiểm tra result và success
                // Kiểm tra lại trạng thái từ backend để đảm bảo chính xác
                const updatedFollowingStatus = await isFollowingStore(storeId);
                setIsFollowing(updatedFollowingStatus);
            }
            // Toast lỗi đã được xử lý bên trong followStore/unfollowStore
        } catch (error) {
            console.error("Error in handleFollowClick:", error);
             toast.error("An error occurred."); // Toast lỗi chung nếu try-catch bắt được lỗi khác
        } finally {
            setFollowLoading(false);
        }
    };

    // --- Render Loading State ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                 <FaSpinner className="animate-spin h-12 w-12 text-gray-500 mb-4" />
                 <p className="text-muted-foreground">Loading store...</p>
             </div>
        );
    }

    // --- Render Error State ---
    if (error) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                 <Alert variant="destructive" className="max-w-md">
                     <AlertCircle className="h-5 w-5" />
                     <AlertTitle>Error</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                 </Alert>
                 <Button asChild variant="outline" className="mt-4">
                     <Link to="/">Go back home</Link>
                 </Button>
             </div>
        );
    }

    // --- Render Store Not Found State ---
    if (!store) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                 <h2 className="text-2xl font-semibold mb-2">Store Not Found</h2>
                 <p className="text-muted-foreground mb-4">The store you are looking for does not exist.</p>
                  <Button asChild variant="outline">
                     <Link to="/">Go back home</Link>
                 </Button>
             </div>
        );
    }

    // --- Render Main Content ---
    return (
        <div className=" min-h-screen flex flex-col"> {/* Light background */}
            {/* Banner */}
            <div className="relative w-full h-52 md:h-64 overflow-hidden mb-8 shadow-md">
                <img
                    src={banner} // Có thể thay bằng store.banner nếu có
                    alt={`${store.storeName} Banner`}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" /> {/* Gradient đậm hơn */}
                <div className="absolute bottom-4 left-4 md:left-8 flex items-center gap-4 z-10">
                    <img
                        src={store.storeLogo || "/default_store_logo.png"}
                        alt={`${store.storeName} Logo`}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                    <div className="text-white">
                        <h1 className="text-2xl md:text-4xl font-bold drop-shadow-md">{store.storeName}</h1>
                        <p className="text-sm md:text-base text-gray-200 drop-shadow-sm">{store.storeAddress || "No address provided"}</p>
                        {/* TODO: Add follower count later */}
                        {/* <p className="text-xs mt-1 text-gray-300">X followers</p> */}
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                {/* "Tabs" & Follow Button Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                    <div className="flex gap-6"> {/* Tăng gap */}
                        {/* Static labels mimicking tabs */}
                        <span className="px-1 py-2 text-lg font-semibold text-gray-900 border-b-2 border-gray-900 cursor-default"> {/* Đậm hơn */}
                            Products
                        </span>
                        <span className="px-1 py-2 text-lg font-medium text-gray-400 hover:text-gray-600 cursor-default"> {/* Nhạt hơn */}
                            About
                        </span>
                         {/* Add more static tabs if needed */}
                    </div>
                    {/* Follow/Unfollow Button using Shadcn */}
                     {token && ( // Chỉ hiển thị nút Follow/Unfollow nếu đã đăng nhập
                        <Button
                            onClick={handleFollowClick}
                            variant={isFollowing ? "destructive" : "default"}
                            size="sm"
                            disabled={isFollowing === null || followLoading}
                            className="w-full sm:w-auto" // Đảm bảo nút không quá rộng trên mobile
                        >
                            {followLoading ? (
                                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                            ) : isFollowing ? (
                                <FaTimesCircle className="mr-2 h-4 w-4" />
                            ) : (
                                <FaCheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {isFollowing === null ? 'Checking...' : isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}
                    {!token && ( // Hiển thị nút yêu cầu đăng nhập nếu chưa login
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/login')} // Điều hướng đến trang login
                            className="w-full sm:w-auto"
                        >
                            Log in to follow
                        </Button>
                    )}
                </div>

                {/* Products Grid Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Store Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                This store hasn't added any products yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Item key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

             <Footer /> {/* Đặt Footer ở cuối cùng */}
        </div>
    );
};

export default StorePage;