import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Item from "../components/Item";
import { toast } from "react-toastify";
import banner from "../assets/banner.jpg";
import Footer from "../components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react"; // Thêm Loader2
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Thêm Avatar

const StorePage = () => {
    const { storeId } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { followStore, unfollowStore, isFollowingStore, token, backendUrl, navigate } = useContext(ShopContext); // Thêm navigate
    const [isFollowing, setIsFollowing] = useState(null);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchStoreData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStore(null); // Reset trước khi fetch
        setProducts([]);
        setIsFollowing(null);

        if (!storeId) {
            setError("Invalid Store ID.");
            setLoading(false);
            return;
        }

        try {
            const [storeResponse, productsResponse] = await Promise.all([
                axios.get(`${backendUrl}/api/store/findStoreById/${storeId}`),
                axios.get(`${backendUrl}/api/store/${storeId}/products`)
            ]);

            // Xử lý kết quả Store
            if (storeResponse.data.success ==true && storeResponse.data.store) {
                setStore(storeResponse.data.store);
                if(token){
                    const checkFollow = async () => {
                         setIsFollowing(null);
                         const following = await isFollowingStore(storeId);
                         setIsFollowing(following);
                    }
                    checkFollow();
                } else {
                    setIsFollowing(false);
                }

            } else {
                 throw new Error(storeResponse.data?.message || "Store not found or could not be loaded.");
            }

            // Xử lý kết quả Products
            if (productsResponse.data.success && Array.isArray(productsResponse.data.products)) {
                setProducts(productsResponse.data.products);
            } else {
                console.warn("Could not load products or invalid format.");
                setProducts([]); // Set rỗng nếu không có sản phẩm hoặc lỗi format
            }

        } catch (err) {
            console.error("Error fetching store page data:", err);
            setError(err.response?.data?.message || err.message || "An error occurred fetching store data.");
            setStore(null); // Reset store nếu lỗi
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [storeId, backendUrl, token, isFollowingStore]); // Thêm token, isFollowingStore

    useEffect(() => {
        fetchStoreData();
    }, [fetchStoreData]); // Chạy khi fetchStoreData thay đổi (tức storeId hoặc backendUrl thay đổi)


    const handleFollowClick = async () => {
        if (!token) { toast.error("Please log in to follow or unfollow a store."); navigate('/login'); return; }
        if (isFollowing === null || followLoading) return;

        setFollowLoading(true);
        try {
            let result;
            if (isFollowing) {
                result = await unfollowStore(storeId);
            } else {
                result = await followStore(storeId);
            }
            if (result && result.success) {
                const updatedFollowingStatus = await isFollowingStore(storeId);
                setIsFollowing(updatedFollowingStatus);
            }
        } catch (error) {
            console.error("Error in handleFollowClick:", error);
            toast.error("An error occurred.");
        } finally {
            setFollowLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
                <p className="text-muted-foreground">Loading store...</p>
            </div>
        );
    }


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
                 <Footer/>
             </div>
        );
    }


    if (!store) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                 <h2 className="text-2xl font-semibold mb-2">Store Not Found</h2>
                 <p className="text-muted-foreground mb-4">The store you are looking for does not exist or is not approved.</p>
                  <Button asChild variant="outline">
                     <Link to="/">Go back home</Link>
                 </Button>
                  <Footer/>
             </div>
        );
    }


    return (
        <div className=" min-h-screen flex flex-col">
            <div className="relative w-full h-52 md:h-64 overflow-hidden mb-8 shadow-md">
                <img src={banner} alt={`${store.storeName} Banner`} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 md:left-8 flex items-center gap-4 z-10">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-4 ring-white dark:ring-gray-800 shadow-lg border">
                         <AvatarImage src={store.avatar || "/default_store_logo.png"} alt={`${store.storeName} Logo`} />
                         {/* <AvatarFallback><Store /></AvatarFallback> */}
                    </Avatar>
                    <div className="text-white">
                        <h1 className="text-2xl md:text-4xl font-bold drop-shadow-md">{store.storeName}</h1>
                        <p className="text-sm md:text-base text-gray-200 drop-shadow-sm">{store.description || "No description"}</p>
                         {/* Có thể hiển thị thêm thông tin owner nếu cần */}
                         {/* {store.owner && <p className="text-xs mt-1 text-gray-300">Owner: {store.owner.firstName} {store.owner.lastName}</p>} */}
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-200 dark:border-border pb-4">
                    <div className="flex gap-6">
                         <span className="px-1 py-2 text-lg font-semibold text-foreground border-b-2 border-primary cursor-default">
                             Products
                         </span>
                         {/* Thêm các tab khác sau nếu cần */}
                    </div>
                     {token ? (
                         <Button
                             onClick={handleFollowClick}
                             variant={isFollowing ? "outline" : "default"} // Đổi variant
                             size="sm"
                             disabled={isFollowing === null || followLoading}
                             className="w-full sm:w-auto"
                         >
                             {followLoading ? ( <Loader2 className="animate-spin mr-2 h-4 w-4" /> ) :
                              isFollowing ? ( <FaTimesCircle className="mr-2 h-4 w-4" /> ) :
                              ( <FaCheckCircle className="mr-2 h-4 w-4" /> )}
                             {isFollowing === null ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                         </Button>
                     ) : (
                         <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="w-full sm:w-auto" >
                             Log in to follow
                         </Button>
                     )}
                </div>

                <Card className="dark:border-border">
                    <CardHeader>
                        <CardTitle className="text-xl">Store Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                This store hasn't added any products yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product) => (
                                    <Item key={product.id} product={product} /> // Truyền product đã được xử lý images
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

             <Footer />
        </div>
    );
};

export default StorePage;