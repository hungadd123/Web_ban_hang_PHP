import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Footer from "../components/Footer";
import banner from "../assets/banner.jpg";
import StoreInfoSection from "../components/StoreInfoSection";
import ProductsSection from "../components/ProductsSection";
import AvatarModal from "../components/AvatarModal";
import EditProductModal from "../components/EditProductModal";
import CreateProductModal from "../components/CreateProductModal";
import StoreOrders from "../components/StoreOrders"; // Component con giờ chỉ nhận props

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Loader2, Store as StoreIcon, AlertCircle, Clock, XCircle, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StoreManagement = () => {
    const [storeInfoData, setStoreInfoData] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [storeAddress, setStoreAddress] = useState("");
    const [products, setProducts] = useState([]);
    const [storeOrders, setStoreOrders] = useState([]); // <-- State mới cho orders
    const [categories, setCategories] = useState([]);
    const [loadingStoreInfo, setLoadingStoreInfo] = useState(true); // Đổi tên loading chính
    const [loadingProducts, setLoadingProducts] = useState(false); // Loading riêng cho products
    const [loadingStoreOrders, setLoadingStoreOrders] = useState(false); // Loading riêng cho orders
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [errorStoreInfo, setErrorStoreInfo] = useState(null); // Lỗi riêng cho store info
    const [errorProducts, setErrorProducts] = useState(null); // Lỗi riêng cho products
    const [errorStoreOrders, setErrorStoreOrders] = useState(null); // Lỗi riêng cho orders

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [activeTab, setActiveTab] = useState("products");

    const { backendUrl, token, currency, updateStoreInfoContext, fetchUserData: fetchUserDataFromContext } = useContext(ShopContext); // Lấy hàm fetch user từ context nếu cần
    const navigate = useNavigate();

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const response = await axios.get(`${backendUrl}/api/category`);
            if (response.status === 200 && Array.isArray(response.data.category)) {
                setCategories(response.data.category);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Fetch categories error:", error);
            setCategories([]);
            toast.error("Error loading categories.");
        } finally {
            setLoadingCategories(false);
        }
    }, [backendUrl]);

    const getStoreProducts = useCallback(async () => {
        if (!token || storeInfoData?.status !== 'approved') {
             setProducts([]); // Reset nếu không đủ điều kiện fetch
             return;
        }
        setLoadingProducts(true);
        setErrorProducts(null);
        try {
            const response = await axios.get(`${backendUrl}/api/store/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data?.success === true && Array.isArray(response.data?.products)) {
                const cleanedProducts = response.data.products.map(p => ({
                    ...p,
                    id: p.id ?? p._id,
                    productName: p.productName || '',
                    productDetail: p.productDetail || '',
                    price: p.price || 0,
                    category_id: p.category_id || '',
                    remainQuantity: p.remainQuantity ?? 0,
                    images: [(p.thumbnail || '/placeholder-image.png'), ...(Array.isArray(p.image_details) ? p.image_details.map(detail => detail.imageUrl) : [])],
                    originalImageDetails: p.image_details || [],
                }));
                setProducts(cleanedProducts);
            } else {
                setErrorProducts(response.data?.message || "Failed to fetch products or invalid format.");
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching store products:", error);
            setErrorProducts(error.response?.data?.message || "Error fetching store products");
            setProducts([]);
        } finally {
             setLoadingProducts(false);
        }
    }, [backendUrl, token, storeInfoData?.status]); // Phụ thuộc status store

    const fetchStoreOrders = useCallback(async () => { // <-- Hàm fetch orders mới
        if (!storeInfoData?.id || !token || storeInfoData?.status !== 'approved') {
             setStoreOrders([]);
             return; // Không fetch nếu chưa có store id, token hoặc store chưa duyệt
        }
        setLoadingStoreOrders(true);
        setErrorStoreOrders(null);
        try {
            const response = await axios.get(`${backendUrl}/api/store/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && Array.isArray(response.data.orders)) {
                setStoreOrders(response.data.orders);
            } else {
                setErrorStoreOrders(response.data?.message || "Failed to load store orders.");
                setStoreOrders([]);
            }
        } catch (err) {
            console.error("API call error fetching store orders:", err);
            setErrorStoreOrders(err.response?.data?.message || err.message || "An unexpected error occurred.");
            setStoreOrders([]);
        } finally {
            setLoadingStoreOrders(false);
        }
    }, [backendUrl, token, storeInfoData?.id, storeInfoData?.status]); // Phụ thuộc storeId và status


    const fetchInitialData = useCallback(async () => { // Đổi tên hàm fetch chính
        if (!token) {
            setErrorStoreInfo("Authentication required.");
            setLoadingStoreInfo(false);
            return;
        }
        setLoadingStoreInfo(true);
        setErrorStoreInfo(null);
        setProducts([]); // Reset products khi fetch lại store
        setStoreOrders([]); // Reset orders khi fetch lại store
        try {
            await fetchCategories();
            const storeRes = await axios.get(`${backendUrl}/api/store/myStore`, { headers: { Authorization: `Bearer ${token}` } });

            if (storeRes.status === 200 && storeRes.data.store) {
                const fetchedStore = storeRes.data.store;
                setStoreInfoData(fetchedStore);
                setStoreName(fetchedStore.storeName || "");
                setStoreAddress(fetchedStore.description || "");
                updateStoreInfoContext(fetchedStore); // Cập nhật context

                // Không fetch products/orders ở đây nữa, để useEffect theo activeTab xử lý
            } else {
                setStoreInfoData(null);
                updateStoreInfoContext(null);
                if (storeRes.status !== 404 && storeRes.status !== 403) {
                     setErrorStoreInfo(storeRes.data?.message || `Error fetching store status: ${storeRes.status}`);
                }
            }
        } catch (err) {
            console.error("Error fetching store management data:", err);
            setErrorStoreInfo(err.response?.data?.message || "An error occurred fetching data.");
            setStoreInfoData(null);
            updateStoreInfoContext(null);
        } finally {
            setLoadingStoreInfo(false);
        }
    }, [backendUrl, token, updateStoreInfoContext, fetchCategories]); // Bỏ getStoreProducts

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // useEffect để fetch dữ liệu cho tab đang active
    useEffect(() => {
        if (storeInfoData?.status !== 'approved') return; // Chỉ fetch nếu store đã duyệt

        if (activeTab === 'products') {
            getStoreProducts();
        } else if (activeTab === 'orders') {
            fetchStoreOrders();
        }
        // Không cần fetch gì cho tab 'info' vì đã có storeInfoData
    }, [activeTab, storeInfoData?.status, getStoreProducts, fetchStoreOrders]);


    const updateStoreInfo = async (e) => {
        e.preventDefault();
        if (!storeInfoData?.id) return;
        setIsSavingProduct(true);
        try {
            const payload = { storeName, description: storeAddress };
            const response = await axios.post( `${backendUrl}/api/store/update`, payload, { headers: { Authorization: `Bearer ${token}` } } );
            if (response.status === 200 && response.data.success) {
                toast.success(response.data?.message || "Store info updated successfully!");
                const updatedStore = response.data.store;
                setStoreInfoData(updatedStore);
                updateStoreInfoContext(updatedStore);
            } else {
                toast.error(response.data?.message || `Failed to update store info`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating store information");
        } finally {
             setIsSavingProduct(false);
        }
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile || !storeInfoData?.id) return toast.error("Please select an avatar file.");
        setIsAvatarUploading(true);
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("storeName", storeName);
        formData.append("description", storeAddress);
        try {
            const response = await axios.post( `${backendUrl}/api/store/update`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } } );
            if (response.status === 200 && response.data.success) {
                toast.success(response.data?.message || "Avatar updated successfully!");
                const updatedStore = response.data.store;
                setStoreInfoData(updatedStore);
                updateStoreInfoContext(updatedStore);
                setShowAvatarModal(false); setAvatarFile(null); setAvatarPreview("");
            } else {
                toast.error(response.data?.message || `Failed to update avatar`);
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error(error.response?.data?.message || "Error updating store avatar");
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm("Are you sure?")) return;
        setIsSavingProduct(true);
        try {
            const response = await axios.delete(`${backendUrl}/api/product/delete/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.status === 200 && response.data.success) {
                toast.success(response.data?.message || "Product deleted.");
                getStoreProducts();
            } else {
                toast.error(response.data?.message || `Failed to delete product.`);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error.response?.data?.message || "Error deleting product");
        } finally {
             setIsSavingProduct(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product); setShowEditProductModal(true);
    };

    const handleSaveProduct = async (formData) => {
        if (!editingProduct?.id) return;
        setIsSavingProduct(true);
        try {
             // Gửi _method nếu cần
             // formData.append('_method', 'PUT');
            const response = await axios.post( // Dùng POST + _method cho update có file
                `${backendUrl}/api/product/update/${editingProduct.id}`, formData, { headers: { Authorization: `Bearer ${token}` } }
            );
             if (response.status === 200) { // Giả định backend trả status trong data
                 toast.success(response.message || "Product updated.");
                 setShowEditProductModal(false); setEditingProduct(null); getStoreProducts();
             } else {
                 const errorMsg = response.message || `Failed to update product`;
                 if (response.data?.errors) { const validationErrors = Object.values(response.data.errors).flat().join('\n'); toast.error(`Validation failed:\n${validationErrors}`); }
                 else { toast.error(errorMsg); }
                 throw new Error(errorMsg);
             }
        } catch (error) {
             console.error("Error updating product:", error);
             if (!error.message?.includes("Failed to update product")) {
                 const errorData = error.response?.data;
                 if (errorData?.errors) { const validationErrors = Object.values(errorData.errors).flat().join('\n'); toast.error(`Validation failed:\n${validationErrors}`); }
                 else { toast.error(errorData?.message || "Error updating product"); }
             }
             throw error;
        } finally {
             setIsSavingProduct(false);
        }
    };

    const handleOpenCreateProduct = () => { setShowCreateProductModal(true); };

    const handleSaveNewProduct = async (formData) => {
        setIsSavingProduct(true);
        try {
            const response = await axios.post(`${backendUrl}/api/product/create`, formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.status === 201 || response.status === 200) {
                toast.success(response.message || "Product added!");
                setShowCreateProductModal(false); getStoreProducts();
            } else {
                 const errorMsg = response.message || "Failed to add product.";
                 if (response.data?.errors) { const validationErrors = Object.values(response.data.errors).flat().join('\n'); toast.error(`Validation failed:\n${validationErrors}`); }
                 else { toast.error(errorMsg); }
                 throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("Error creating product:", error);
            if (!error.message?.includes("Failed to add product")) {
                 const errorData = error.response?.data;
                 if (errorData?.errors) { const validationErrors = Object.values(errorData.errors).flat().join('\n'); toast.error(`Validation failed:\n${validationErrors}`); }
                 else { toast.error(errorData?.message || "Error creating product"); }
            }
            throw error;
        } finally {
             setIsSavingProduct(false);
        }
    };

    if (loadingStoreInfo) { return ( <div className="flex justify-center items-center h-[calc(100vh-150px)]"> <Loader2 className="h-10 w-10 animate-spin text-primary" /> </div> ); }
    if (errorStoreInfo && !storeInfoData) { return ( <div className="max-padd-container mt-10"> <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Store Data</AlertTitle> <AlertDescription> {errorStoreInfo} - Please try refreshing or logging in again. </AlertDescription> <Button onClick={() => window.location.reload()} size="sm" variant="secondary" className="mt-2">Refresh</Button> </Alert> <Footer /> </div> ); }
    if (!storeInfoData) { return ( <div className="max-padd-container mt-10 text-center"> <Alert> <StoreIcon className="h-4 w-4" /> <AlertTitle>No Store Found</AlertTitle> <AlertDescription> It seems you don't have a store yet or it's not approved. <div className="mt-2"> <Button asChild size="sm"> <Link to="/request-store">Request Store Opening</Link> </Button> </div> </AlertDescription> </Alert> <Footer/> </div> ); }
    if (storeInfoData.status !== 'approved') { return ( <div className="max-padd-container mt-10 text-center"> <Card className="max-w-md mx-auto"> <CardHeader> <CardTitle className="flex items-center justify-center gap-2"> {storeInfoData.status === 'pending' ? <Clock className="h-6 w-6 text-yellow-500"/> : <XCircle className="h-6 w-6 text-destructive"/>} Store Status: <span className="capitalize font-bold">{storeInfoData.status}</span> </CardTitle> </CardHeader> <CardContent> {storeInfoData.status === 'pending' && <p className="text-muted-foreground">Your store request is currently pending approval.</p>} {storeInfoData.status === 'rejected' && <p className="text-destructive">Your store request has been rejected.</p>} </CardContent> <CardFooter className="justify-center"> <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button> </CardFooter> </Card> <Footer/> </div> ); }

    return (
        <div className="min-h-screen">
            <div className="relative w-full h-48 md:h-64 overflow-hidden mb-8 group">
                 <img src={banner} alt="Store Banner" className="object-cover w-full h-full" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                 <div className="absolute bottom-4 left-4 md:left-6 flex items-end gap-4 z-10">
                     <div className="relative">
                         <img src={avatarPreview || storeInfoData.avatar || "/default_store_logo.png"} alt="Store Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-md" />
                         <Button variant="secondary" size="icon" className="absolute -bottom-1 -right-1 rounded-full h-7 w-7 p-1 border-2 border-background" onClick={() => { setAvatarPreview(storeInfoData.avatar || "/default_store_logo.png"); setAvatarFile(null); setShowAvatarModal(true); }} aria-label="Change store avatar" > <Camera className="w-4 h-4" /> </Button>
                     </div>
                     <div className="text-white pb-1">
                         <h2 className="text-xl md:text-2xl font-bold mb-0.5 line-clamp-1">{storeName || "..."}</h2>
                         <p className="text-sm md:text-base text-gray-200 line-clamp-1">{storeAddress || storeInfoData.description || "..."}</p> {/* Use state storeAddress */}
                     </div>
                 </div>
             </div>
             <div className="max-padd-container pb-12">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                     <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6 md:mb-8">
                         <TabsTrigger value="info">Store Info</TabsTrigger>
                         <TabsTrigger value="products">Products</TabsTrigger>
                         <TabsTrigger value="orders">Orders</TabsTrigger>
                     </TabsList>
                     <TabsContent value="info">
                         <StoreInfoSection storeName={storeName} setStoreName={setStoreName} storeAddress={storeAddress} setStoreAddress={setStoreAddress} updateStoreInfo={updateStoreInfo} isLoading={isSavingProduct}/>
                     </TabsContent>
                     <TabsContent value="products">
                        <ProductsSection products={products} currency={currency} onEdit={handleEditProduct} onDelete={deleteProduct} onCreate={handleOpenCreateProduct} isLoading={loadingProducts} error={errorProducts} />
                     </TabsContent>
                     <TabsContent value="orders">
                         <StoreOrders orders={storeOrders} isLoading={loadingStoreOrders} error={errorStoreOrders} onRetry={fetchStoreOrders} />
                     </TabsContent>
                 </Tabs>
             </div>
             {showAvatarModal && ( <AvatarModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} avatarPreview={avatarPreview || storeInfoData.avatar || "/default_store_logo.png"} handleAvatarChange={handleAvatarChange} handleSaveAvatar={handleSaveAvatar} isLoading={isAvatarUploading} /> )}
             {showEditProductModal && editingProduct && ( <EditProductModal isOpen={showEditProductModal} onClose={() => { setShowEditProductModal(false); setEditingProduct(null); }} editingProduct={editingProduct} handleSaveProduct={handleSaveProduct} isLoading={isSavingProduct} categories={categories} /> )}
             {showCreateProductModal && ( <CreateProductModal isOpen={showCreateProductModal} onClose={() => setShowCreateProductModal(false)} handleSaveNewProduct={handleSaveNewProduct} storeId={storeInfoData?.id} isLoading={isSavingProduct} categories={categories} /> )}
             <Footer />
        </div>
    );
};

export default StoreManagement;