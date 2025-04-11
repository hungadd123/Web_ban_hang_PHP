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
import StoreOrders from "../components/StoreOrders";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Store, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';


const StoreManagement = () => {

    const [storeInfo, setStoreInfo] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [storeAddress, setStoreAddress] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductData, setEditProductData] = useState({ name: '', description: '', price: '', category: '', popular: false, colors: '' });

    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [createProductData, setCreateProductData] = useState({ name: '', description: '', price: '', category: '', popular: false, colors: '' });

    const { backendUrl, token, currency, updateStoreInfoContext, storeInfo: contextStoreInfo } = useContext(ShopContext);

    const fetchInitialData = useCallback(async () => {
        if (!token) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [storeRes, productsRes] = await Promise.all([
                axios.get(`${backendUrl}/api/store-management/my-store`, { headers: { token } }),
                axios.get(`${backendUrl}/api/store-management/products`, { headers: { token } })
            ]);

            if (storeRes.data.success && storeRes.data.store) {
                const fetchedStore = storeRes.data.store;
                setStoreInfo(fetchedStore);
                setStoreName(fetchedStore.storeName || "");
                setStoreAddress(fetchedStore.storeAddress || "");
                 if (!contextStoreInfo) {
                    updateStoreInfoContext(fetchedStore);
                 }
            } else {
                setStoreInfo(null);
                setStoreName("");
                setStoreAddress("");
                console.log(storeRes.data.message || "No approved store found or fetch failed.");
            }

            if (productsRes.data.success) {
                 const cleanedProducts = (productsRes.data.products || []).map(p => ({
                    ...p,
                    colors: Array.isArray(p.colors) ? p.colors.map(c => String(c).replace(/['"]+/g, '')) : [],
                    image: Array.isArray(p.image) ? p.image : (typeof p.image === 'string' ? p.image.split(',').map(url => url.trim()) : [])
                }));
                setProducts(cleanedProducts);
            } else {
                toast.error(productsRes.data.message || "Failed to fetch products.");
                setProducts([]);
            }

        } catch (err) {
            console.error("Error fetching initial store management data:", err);
            setError(err.response?.data?.message || "An error occurred fetching data.");
            setStoreInfo(null);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [backendUrl, token, updateStoreInfoContext, contextStoreInfo]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

      const updateStoreInfo = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${backendUrl}/api/store-management/update-info`,
                { storeName, storeAddress },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                const updatedStore = response.data.store;
                setStoreInfo(updatedStore);
                updateStoreInfoContext(updatedStore);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating store information");
        }
    };

     const handleSaveAvatar = async () => {
        if (!avatarFile) return toast.error("Please select an avatar file.");
        setIsAvatarUploading(true);
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        try {
            const response = await axios.put(
                `${backendUrl}/api/store-management/update-avatar`,
                formData, { headers: { token, "Content-Type": "multipart/form-data" } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                const updatedStore = { ...storeInfo, storeLogo: response.data.storeLogo };
                setStoreInfo(updatedStore);
                updateStoreInfoContext(updatedStore);
                setShowAvatarModal(false);
                setAvatarFile(null);
                setAvatarPreview("");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating store avatar");
        } finally {
             setIsAvatarUploading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
     };

     const getStoreProducts = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/store-management/products`, {
            headers: { token },
          });
          if (response.data.success) {
             const cleanedProducts = (response.data.products || []).map(p => ({
                ...p,
                colors: Array.isArray(p.colors) ? p.colors.map(c => String(c).replace(/['"]+/g, '')) : [],
                image: Array.isArray(p.image) ? p.image : (typeof p.image === 'string' ? p.image.split(',').map(url => url.trim()) : [])
            }));
            setProducts(cleanedProducts);
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          console.error(error);
          toast.error(
            error.response?.data?.message || "Error fetching store products"
          );
        }
      };


     const deleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
             return;
        }
        try {
          const response = await axios.delete(`${backendUrl}/api/store-management/products/${productId}`, {
            headers: { token },
          });
          if (response.data.success) {
            toast.success(response.data.message);
            getStoreProducts();
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          console.error(error);
          toast.error(
            error.response?.data?.message || "Error deleting product"
          );
        }
      };

     const handleEditProduct = (product) => {
        setEditingProduct(product);
        setEditProductData({
            name: product.name || "",
            price: product.price || "",
            description: product.description || "",
            category: product.category || "",
            popular: product.popular || false,
            colors: product.colors ? product.colors.join(", ") : "",
        });
        setShowEditProductModal(true);
     };

      const handleSaveProduct = async () => {
        if (!editingProduct) return;
        try {
            const priceAsNumber = parseFloat(editProductData.price);
            if (isNaN(priceAsNumber) || priceAsNumber < 0) {
                 toast.error("Price must be a valid non-negative number.");
                 return;
            }

            const response = await axios.put(
                `${backendUrl}/api/store-management/products/${editingProduct._id}`,
                {
                 ...editProductData,
                 price: priceAsNumber,
                 colors: editProductData.colors.split(',').map(c => c.trim().replace(/['"]+/g, '')).filter(c => c),
                },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                setShowEditProductModal(false);
                setEditingProduct(null);
                getStoreProducts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Error updating product"
            );
        }
     };

     const handleOpenCreateProduct = () => {
        setCreateProductData({
            name: "", price: "", description: "", category: "", popular: false, colors: ""
        });
        setShowCreateProductModal(true);
     };

     const handleSaveNewProduct = async (formData) => {
        try {
          const response = await axios.post(
            `${backendUrl}/api/store-management/products`,
            formData,
            { headers: { token } } // Axios sets Content-Type for FormData automatically
          );
          if (response.data.success) {
            toast.success(response.data.message);
            setShowCreateProductModal(false);
            getStoreProducts();
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          console.error(error);
          toast.error(
            error.response?.data?.message || "Error creating product"
          );
        }
      };


    if (loading) {
        return (
             <div className="flex justify-center items-center h-[calc(100vh-150px)]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

     if (error && !storeInfo) { // Show error more prominently if initial load completely failed
         return (
              <div className="max-padd-container mt-10">
                 <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error Loading Store Data</AlertTitle>
                     <AlertDescription>
                         {error} - Please try refreshing the page or logging in again.
                     </AlertDescription>
                      <Button onClick={() => window.location.reload()} size="sm" variant="secondary" className="mt-2">Refresh Page</Button>
                 </Alert>
              </div>
         );
     }

     if (!storeInfo) {
         return (
              <div className="max-padd-container mt-10 text-center">
                 <Alert>
                     <Store className="h-4 w-4" />
                     <AlertTitle>No Approved Store Found</AlertTitle>
                     <AlertDescription>
                          You don't have an approved store yet, or there was an issue loading it. You can request one or wait for approval.
                          <div className="mt-4">
                              <Button asChild>
                                  <Link to="/request-store">Request Store Opening</Link>
                              </Button>
                          </div>
                     </AlertDescription>
                 </Alert>
              </div>
         );
     }


    return (
        <div className="min-h-screen">
            <div className="relative w-full h-48 md:h-64 overflow-hidden mb-8 group">
                <img
                    src={banner}
                    alt="Store Banner"
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                 {storeInfo && (
                     <div className="absolute bottom-4 left-4 md:left-6 flex items-end gap-4 z-10">
                         <div className="relative">
                             <img
                                src={avatarPreview || storeInfo.storeLogo || "/default_store_logo.png"}
                                alt="Store Avatar"
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
                            />
                             <Button
                                variant="secondary"
                                size="icon"
                                className="absolute -bottom-1 -right-1 rounded-full h-7 w-7 p-1 border-2 border-background"
                                onClick={() => {
                                    setAvatarPreview(storeInfo.storeLogo || "/default_store_logo.png");
                                    setAvatarFile(null);
                                    setShowAvatarModal(true);
                                }}
                                aria-label="Change store avatar"
                            >
                                <Camera className="w-4 h-4" />
                            </Button>
                         </div>
                         <div className="text-white pb-1">
                             <h2 className="text-xl md:text-2xl font-bold mb-0.5 line-clamp-1">{storeName || "..."}</h2>
                             <p className="text-sm md:text-base text-gray-200 line-clamp-1">{storeAddress || "..."}</p>
                         </div>
                     </div>
                 )}
            </div>
            <div className="max-padd-container pb-12">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6 md:mb-8">
                        <TabsTrigger value="info">Store Info</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <StoreInfoSection
                            storeName={storeName}
                            setStoreName={setStoreName}
                            storeAddress={storeAddress}
                            setStoreAddress={setStoreAddress}
                            updateStoreInfo={updateStoreInfo}
                        />
                    </TabsContent>
                    <TabsContent value="products">
                        <ProductsSection
                            products={products}
                            currency={currency}
                            onEdit={handleEditProduct}
                            onDelete={deleteProduct}
                            onCreate={handleOpenCreateProduct}
                        />
                    </TabsContent>
                    <TabsContent value="orders">
                        <StoreOrders backendUrl={backendUrl} token={token} storeInfo={storeInfo}/>
                    </TabsContent>
                </Tabs>
            </div>
             {showAvatarModal && (
                 <AvatarModal
                     isOpen={showAvatarModal}
                     onClose={() => setShowAvatarModal(false)}
                     avatarPreview={avatarPreview}
                     handleAvatarChange={handleAvatarChange}
                     handleSaveAvatar={handleSaveAvatar}
                     isLoading={isAvatarUploading}
                 />
             )}
             {showEditProductModal && editingProduct && (
                 <EditProductModal
                     isOpen={showEditProductModal}
                     onClose={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                     editProductData={editProductData}
                     setEditProductData={setEditProductData}
                     handleSaveProduct={handleSaveProduct}
                 />
             )}
            {showCreateProductModal && (
                <CreateProductModal
                    isOpen={showCreateProductModal}
                    onClose={() => setShowCreateProductModal(false)}
                    createProductData={createProductData}
                    setCreateProductData={setCreateProductData}
                    handleSaveNewProduct={handleSaveNewProduct}
                />
            )}

            <Footer />
        </div>
    );
};

export default StoreManagement;