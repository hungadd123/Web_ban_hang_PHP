import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [storeInfo, setStoreInfo] = useState(
        JSON.parse(localStorage.getItem("storeInfo")) || null
    );
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);
    const [userNotifications, setUserNotifications] = useState([]);
    const [user, setUser] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const currency = "VND";
    const delivery_charges = 30000;

    const updateStoreInfoContext = useCallback((data) => {
        setStoreInfo(data);
        if (data) {
            localStorage.setItem("storeInfo", JSON.stringify(data));
        } else {
            localStorage.removeItem("storeInfo");
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        if (!token) {
            setUser(null);
            updateStoreInfoContext(null);
            return;
        }
        try {
            const response = await axios.get(`${backendUrl}/api/user/getProfile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });

            if (response.data.status === 200 && response.data.user) {
                setUser(response.data.user);
                try {
                    const storeRes = await axios.get(`${backendUrl}/api/store/myStore`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    });
                    if ((storeRes.data.status === 200 || storeRes.status === 200) && storeRes.data.store) {
                        updateStoreInfoContext(storeRes.data.store);
                    } else {
                        updateStoreInfoContext(null);
                    }
                } catch (storeError) {
                     if (storeError.response && (storeError.response.status === 404 || storeError.response.status === 403)) {
                         updateStoreInfoContext(null);
                     } else if (storeError.response && storeError.response.status === 401) {
                        setToken(""); localStorage.removeItem("token");
                        updateStoreInfoContext(null); setUser(null); setCartItems({});
                        toast.warn("Session expired. Please log in again.");
                        navigate("/login");
                     } else {
                         console.error("Error fetching store status:", storeError);
                         updateStoreInfoContext(null);
                     }
                }
            } else {
                console.error("Fetch user profile failed:", response.data?.message || `Status ${response.status}`);
                 if (response.status === 401 || response.data?.status === 401 || response.data?.status !== 200) {
                    setToken(""); localStorage.removeItem("token");
                    updateStoreInfoContext(null); setUser(null); setCartItems({});
                    toast.warn("Session expired or invalid. Please log in again.");
                    navigate("/login");
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            if (error.response && error.response.status === 401) {
                setToken(""); localStorage.removeItem("token");
                updateStoreInfoContext(null); setUser(null); setCartItems({});
                toast.warn("Session expired. Please log in again.");
                navigate("/login");
            }
        }
    }, [token, backendUrl, navigate, updateStoreInfoContext]);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/`); // Endpoint lấy danh sách public

            const rawProducts = Array.isArray(response.data) ? response.data : []; // API này trả về mảng trực tiếp

            const cleanedProducts = rawProducts.map(product => {
                const thumbnail = product.thumbnail || '/placeholder-image.png';
                // API này không trả về image_details hoặc colors trực tiếp trong list
                // Giữ lại category object nếu cần dùng ở Collection page
                return {
                    ...product,
                    id: product.id ?? product._id,
                    images: [thumbnail], // Chỉ có thumbnail trong mảng images từ API này
                };
            });
            setProducts(cleanedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products.");
            setProducts([]);
        }
    }, [backendUrl]);

    const getUserCart = useCallback(async () => {
        if (!token) { setCartItems({}); return; }
        try {
            const response = await axios.get(`${backendUrl}/api/cart/`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            if (response.data?.status === 200 && typeof response.data?.cart === 'object') {
                const backendCart = response.data.cart;
                const newCartItems = {};
                for (const storeId in backendCart) {
                     const itemsArray = backendCart[storeId];
                     if (Array.isArray(itemsArray)) {
                         itemsArray.forEach(item => {
                             if (item.product_id && item.quantity) {
                                 newCartItems[item.product_id] = item.quantity;
                             }
                         });
                     }
                }
                setCartItems(newCartItems);
            } else {
                setCartItems({});
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartItems({});
        }
    }, [token, backendUrl]);

    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await fetchProducts();
            if (token) {
                await Promise.all([
                    fetchUserData(),
                    getUserCart(),
                ]);
            } else {
                setUser(null);
                updateStoreInfoContext(null);
                setCartItems({});
            }
            setLoading(false);
        };
        initialLoad();
    }, [token, fetchProducts, fetchUserData, getUserCart]);


    useEffect(() => {
        let timer;
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setToken("");
                localStorage.removeItem("token");
                localStorage.removeItem("storeInfo");
                setUser(null);
                setStoreInfo(null);
                setCartItems({});
                toast.warn("Your session has expired. Please log in again.");
                navigate("/login");
            }, 30 * 60 * 1000);
        };
        if (token) {
            window.addEventListener("mousemove", resetTimer);
            window.addEventListener("keypress", resetTimer);
            window.addEventListener("click", resetTimer);
            resetTimer();
        } else {
            if (timer) clearTimeout(timer);
        }
        return () => {
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
            window.removeEventListener("click", resetTimer);
            if (timer) clearTimeout(timer);
        };
    }, [token, navigate, updateStoreInfoContext]);

    const addToCart = async (productId) => {
        if (!token) { toast.error("Please log in to add items."); return; }
        const currentQuantity = cartItems[productId] || 0;
        const newQuantity = currentQuantity + 1;
        setCartItems(prev => ({ ...prev, [productId]: newQuantity }));
        try {
            await axios.post(`${backendUrl}/api/cart/add/${productId}`, { quantity: 1 }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
            toast.success("Item added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error(error.response?.data?.message || "Error adding item to cart.");
            setCartItems(prev => { const current = prev[productId]; if (current - 1 <= 0) { const { [productId]: _, ...rest } = prev; return rest; } return { ...prev, [productId]: current - 1}; });
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 0 || !token) return;
        const currentQuantity = cartItems[productId] || 0;
        const optimisticCart = { ...cartItems };
        if (quantity === 0) { delete optimisticCart[productId]; } else { optimisticCart[productId] = quantity; }
        setCartItems(optimisticCart);
        const backendMethod = quantity > 0 ? 'put' : 'delete';
        const backendUrlUpdate = quantity > 0 ? `${backendUrl}/api/cart/update/${productId}` : `${backendUrl}/api/cart/delete/${productId}`;
        const payload = quantity > 0 ? { quantity } : {};
        try {
            await axios({ method: backendMethod, url: backendUrlUpdate, data: payload, headers: { Authorization: `Bearer ${token}` }, withCredentials: true, });
        } catch (error) {
            console.error("Error updating cart quantity:", error);
            toast.error(error.response?.data?.message || "Error updating cart item.");
            setCartItems(prev => ({...prev, [productId]: currentQuantity}));
            await getUserCart();
        }
    };

    const removeFromCart = async (productId) => {
        const currentQuantity = cartItems[productId] || 0;
        if (currentQuantity === 0) return;
        setCartItems(prev => { const newCart = { ...prev }; delete newCart[productId]; return newCart; });
        if (token) {
            try { await axios.delete(`${backendUrl}/api/cart/delete/${productId}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }); }
            catch (error) { console.error("Error removing from cart:", error); toast.error(error.response?.data?.message || "Error removing item."); setCartItems(prev => ({...prev, [productId]: currentQuantity})); }
        }
    };

    const getCartCount = () => { let totalCount = 0; for (const itemId in cartItems) { if (cartItems[itemId] > 0) { totalCount += cartItems[itemId]; } } return totalCount; };
    const getCartAmount = () => { let totalAmount = 0; for (const itemId in cartItems) { if (cartItems[itemId] > 0) { const itemInfo = products.find((product) => String(product.id) === itemId); if (itemInfo) { totalAmount += itemInfo.price * cartItems[itemId]; } } } return totalAmount; };

    const followStore = useCallback(async (storeId) => {
        if (!token) { toast.error("Please log in."); return { success: false }; }
        try {
            const response = await axios.post(`${backendUrl}/api/followers/create`, { store_id: storeId }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
            if (response.data?.success || response.status === 200 || response.status === 201) { toast.success(response.data?.message || "Followed store successfully!"); return { success: true }; }
            else { toast.error(response.data?.message || "Failed to follow store."); return { success: false, message: response.data?.message }; }
        } catch (error) { console.error("Error following store:", error); toast.error(error.response?.data?.message || "Failed to follow store."); return { success: false }; }
    }, [token, backendUrl]);

    const unfollowStore = useCallback(async (storeId) => {
        if (!token) { toast.error("Please log in."); return { success: false }; }
        try {
            const response = await axios.delete(`${backendUrl}/api/followers/delete/${storeId}`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
             if (response.data?.success || response.status === 200) { toast.success(response.data?.message || "Unfollowed store successfully!"); return { success: true }; }
             else { toast.error(response.data?.message || "Failed to unfollow store."); return { success: false, message: response.data?.message }; }
        } catch (error) { console.error("Error unfollowing store:", error); toast.error(error.response?.data?.message || "Failed to unfollow store."); return { success: false }; }
    }, [token, backendUrl]);

    const isFollowingStore = useCallback(async (storeId) => {
        if (!token) return false;
        try {
            const response = await axios.get(`${backendUrl}/api/followers/get`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
             if (response.data?.success && Array.isArray(response.data?.following)) { return response.data.following.some(follow => String(follow.store_id) === String(storeId)); }
             return false;
        } catch (error) { console.error("Error checking follow status:", error); return false; }
    }, [token, backendUrl]);


    const value = {
        navigate, products, search, setSearch, currency, delivery_charges, cartItems, setCartItems, addToCart,
        removeFromCart, getCartCount, updateQuantity, getCartAmount, token, setToken, backendUrl, storeInfo,
        updateStoreInfoContext, followStore, unfollowStore, isFollowingStore, user, setUser, loading,
        fetchUserData, getUserCart
    };


    return (
        <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
    );
};

export default ShopContextProvider;