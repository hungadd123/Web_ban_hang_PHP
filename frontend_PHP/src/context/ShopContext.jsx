// src/context/ShopContext.jsx (Phiên bản đầy đủ và sửa lỗi)
import React, { createContext, useEffect, useState, useCallback } from "react"; // Thêm useCallback
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
    const [loading, setLoading] = useState(true); // Loading chung cho dữ liệu ban đầu
    const [userNotifications, setUserNotifications] = useState([]);
    const [user, setUser] = useState(null); // State cho thông tin user

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const currency = "";
    const delivery_charges = 30000;

    // --- CÁC HÀM FETCH DỮ LIỆU ---

    const fetchUserData = useCallback(async () => { // Bọc trong useCallback
        if (!token) {
             setUser(null); // Xóa user nếu không có token
             // setLoading(false); // Không set loading ở đây nữa
             return;
        }
        // setLoading(true); // Không cần thiết nếu initialLoad quản lý
        try {
            const response = await axios.get(`${backendUrl}/api/user/info`, {
                headers: { token: token },
            });
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                console.error("Fetch user failed:", response.data.message);
                if (response.status === 401) { // Token không hợp lệ hoặc hết hạn
                    setToken("");
                    localStorage.removeItem("token");
                    updateStoreInfoContext(null); // Xóa store info
                    setUser(null);
                    toast.warn("Session expired. Please log in again.");
                    navigate("/login");
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            if (error.response && error.response.status === 401) {
                setToken("");
                localStorage.removeItem("token");
                updateStoreInfoContext(null);
                setUser(null);
                toast.warn("Session expired. Please log in again.");
                navigate("/login");
            }
        } finally {
            // setLoading(false); // Quản lý bởi initialLoad
        }
    }, [token, backendUrl, navigate]); // Thêm navigate

    const fetchProducts = useCallback(async () => {
        try {
            
            const response = await axios.get(`${backendUrl}/api/product/`, {
                withCredentials: true,
            });
    
            const rawProducts = Array.isArray(response.data) ? response.data : [];
    
            const cleanedProducts = rawProducts.map(product => {
                // Dùng thumbnail 
                const cleanedImages = product.thumbnail
                    ? [product.thumbnail]
                    : ['/placeholder-image.png'];
    
                // Xử lý colors 
                let cleanedColors = [];
                if (product.colors) {
                    if (Array.isArray(product.colors)) {
                        cleanedColors = product.colors
                            .map(color => typeof color === 'string' ? color.replace(/['"]+/g, '') : color)
                            .filter(Boolean);
                    } else if (typeof product.colors === 'string') {
                        try {
                            const parsedColors = JSON.parse(product.colors);
                            if (Array.isArray(parsedColors)) {
                                cleanedColors = parsedColors.map(color =>
                                    typeof color === 'string' ? color.replace(/['"]+/g, '') : color
                                ).filter(Boolean);
                            } else {
                                cleanedColors = product.colors
                                    .split(',')
                                    .map(c => c.trim().replace(/['"]+/g, ''))
                                    .filter(Boolean);
                            }
                        } catch (e) {
                            cleanedColors = product.colors
                                .split(',')
                                .map(c => c.trim().replace(/['"]+/g, ''))
                                .filter(Boolean);
                        }
                    }
                }
    
                return { ...product, image: cleanedImages, colors: cleanedColors };
            });
    
            setProducts(cleanedProducts);
        } catch (error) {
            console.log("Error fetching products:", error);
            toast.error("Failed to load products.");
        }
    }, [backendUrl]);
    
    

    const fetchStoreData = useCallback(async () => { // Bọc trong useCallback
        if (!token) {
            updateStoreInfoContext(null); // Xóa store info nếu không có token
            return;
        }
        try {
            const response = await axios.get(`${backendUrl}/api/store/info`, {
                headers: { token },
            });
            if (response.data.success) {
                updateStoreInfoContext(response.data.store);
            } else {
                // Không nhất thiết là lỗi nếu user không có store
                 updateStoreInfoContext(null);
                // toast.error(response.data.message);
            }
        } catch (error) {
             updateStoreInfoContext(null);
             if (!(error.response && error.response.status === 404)) {
                console.error("Error fetching store info:", error);
                toast.error(error.response?.data?.message || "Error fetching store information");
            }
        }
    }, [token, backendUrl]); // Phụ thuộc token và backendUrl


     const getUserCart = useCallback(async () => { // Bọc trong useCallback
        if (!token) {
             setCartItems({}); // Xóa cart nếu không có token
             return;
        }
        try {
            const response = await axios.post(
                backendUrl + "/api/cart/get",
                {},
                { headers: { token } }
            );
            if (response.data.success) {
                setCartItems(response.data.cartData || {}); // Đảm bảo là object
            }
        } catch (error) {
            console.log("Error fetching cart:", error);
            // Không cần toast lỗi ở đây, có thể giỏ hàng trống
        }
    }, [token, backendUrl]);

    // --- Effect chính để load dữ liệu ban đầu ---
    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await fetchProducts(); // Luôn fetch products
            if (token) {
                 // Fetch user, cart, store info song song nếu có token
                 await Promise.all([
                     fetchUserData(),
                     getUserCart(),
                     fetchStoreData()
                 ]);
            } else {
                // Nếu không có token, xóa user và store info
                setUser(null);
                updateStoreInfoContext(null);
                setCartItems({});
            }
             setLoading(false); // Kết thúc loading sau khi tất cả hoàn thành
        };
        initialLoad();
    }, [token, fetchProducts, fetchUserData, getUserCart, fetchStoreData]); // Thêm các hàm fetch vào dependencies

     // Cập nhật store info và lưu vào localStorage
     const updateStoreInfoContext = (data) => {
        setStoreInfo(data);
        if (data) {
            localStorage.setItem("storeInfo", JSON.stringify(data));
        } else {
            localStorage.removeItem("storeInfo");
        }
     };

    // --- HÀM FOLLOW/UNFOLLOW (ĐÃ CÓ VÀ ĐÚNG) ---
    const followStore = async (storeId) => {
       if (!token) {
           toast.error("Please log in to follow a store.");
           return { success: false };
       }
       if (!user?._id) { // Kiểm tra user và user._id
           toast.error("User data not available yet.");
           return { success: false };
       }
       try {
           const response = await axios.post(
               `${backendUrl}/api/store/follow/${storeId}`,
               { userId: user._id },
               { headers: { token } }
           );
           if (response.data.success) {
               await fetchUserData(); // Cập nhật lại thông tin user (bao gồm cả list following)
               toast.success(response.data.message);
               return { success: true };
           } else {
               toast.error(response.data.message);
               return { success: false, message: response.data.message };
           }
       } catch (error) {
           console.error("Error following store:", error);
           toast.error(error.response?.data?.message || "Failed to follow store.");
           return { success: false };
       }
   };

   const unfollowStore = async (storeId) => {
       if (!token) {
           toast.error("Please log in to unfollow a store.");
           return { success: false };
       }
        if (!user?._id) {
           toast.error("User data not available yet.");
           return { success: false };
       }
       try {
           const response = await axios.post(
               `${backendUrl}/api/store/unfollow/${storeId}`,
               { userId: user._id },
               { headers: { token } }
           );
           if (response.data.success) {
               await fetchUserData(); // Cập nhật lại thông tin user
               toast.success(response.data.message);
               return { success: true };
           } else {
               toast.error(response.data.message);
               return { success: false, message: response.data.message };
           }
       } catch (error) {
           console.error("Error unfollowing store:", error);
           toast.error(error.response?.data?.message || "Failed to unfollow store.");
           return { success: false };
       }
   };

   const isFollowingStore = async (storeId) => {
       if (!token || !user?._id) return false;

       try {
           const response = await axios.post(`${backendUrl}/api/store/isfollowing/${storeId}`,
               { userId: user._id }, // Gửi userId trong body
               { headers: { token } }
           );
           return response.data.isFollowing;
       } catch (error) {
           console.error("Error checking follow status:", error);
           // Không nên toast lỗi ở đây vì nó có thể chạy ngầm
           return false;
       }
   };
   // --- KẾT THÚC HÀM FOLLOW/UNFOLLOW ---


    // --- AUTO LOGOUT (Giữ nguyên) ---
    useEffect(() => {
        let timer;
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setToken("");
                localStorage.removeItem("token");
                updateStoreInfoContext(null);
                setUser(null);
                setCartItems({});
                toast.warn("Your session has expired. Please log in again.");
                navigate("/login");
            }, 30 * 60 * 1000); // 30 phút
        };

         if (token) { // Chỉ chạy timer khi có token
             window.addEventListener("mousemove", resetTimer);
             window.addEventListener("keypress", resetTimer);
             window.addEventListener("click", resetTimer); // Thêm click
             resetTimer(); // Khởi tạo timer
         } else {
             if (timer) clearTimeout(timer); // Xóa timer nếu không có token
         }

        return () => {
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
             window.removeEventListener("click", resetTimer);
            if (timer) clearTimeout(timer);
        };
    }, [token, navigate]); // Chạy lại khi token hoặc navigate thay đổi


    // --- CÁC HÀM GIỎ HÀNG (Giữ nguyên logic, đã sửa ở lần trước) ---
    const addToCart = async (itemId, color) => {
       if (!color) {
           toast.error("Please select the color first");
           return;
       }
       setCartItems((prev) => {
           const newCart = structuredClone(prev);
           if (!newCart[itemId]) {
               newCart[itemId] = {};
           }
            newCart[itemId][color] = (newCart[itemId][color] || 0) + 1;
           return newCart;
       });

       if (token) {
           try {
               await axios.post(
                   backendUrl + "/api/cart/add",
                   { itemId, color },
                   { headers: { token } }
               );
           } catch (error) {
               console.log("Error adding to backend cart:", error);
               toast.error(error.response?.data?.message || "Error adding to cart");
               await getUserCart(); // Fetch lại cart để đồng bộ nếu lỗi
           }
       }
   };

    const updateQuantity = async (itemId, color, quantity) => {
       if (quantity < 0) return;

       setCartItems((prev) => {
           const newCart = structuredClone(prev);
           if (newCart[itemId]?.[color] !== undefined) {
               if (quantity === 0) {
                   delete newCart[itemId][color];
                   if (Object.keys(newCart[itemId]).length === 0) {
                       delete newCart[itemId];
                   }
               } else {
                   newCart[itemId][color] = quantity;
               }
           }
           return newCart;
       });

       if (token) {
           try {
               await axios.post(
                   backendUrl + "/api/cart/update",
                   { itemId, color, quantity },
                   { headers: { token } }
               );
           } catch (error) {
               console.log("Error updating backend cart:", error);
               toast.error(error.response?.data?.message || "Error updating cart");
               await getUserCart(); // Fetch lại cart
           }
       }
   };

     const removeFromCart = (itemId, color) => {
       updateQuantity(itemId, color, 0);
   };

    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            for (const color in cartItems[itemId]) {
                totalCount += cartItems[itemId][color];
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo) {
                for (const color in cartItems[itemId]) {
                    totalAmount += itemInfo.price * cartItems[itemId][color];
                }
            } else {
                console.warn(`Product with ID ${itemId} not found in products list for cart calculation.`);
            }
        }
        return totalAmount;
    };
    // --- KẾT THÚC HÀM GIỎ HÀNG ---


    // --- OBJECT VALUE CHO CONTEXT PROVIDER ---
    const value = {
        navigate,
        products,
        search,
        setSearch,
        currency,
        delivery_charges,
        cartItems,
        setCartItems, // Cần thiết để cập nhật từ bên ngoài nếu có
        addToCart,
        removeFromCart, // Thêm hàm xóa
        getCartCount,
        updateQuantity,
        getCartAmount,
        token,
        setToken,
        backendUrl,
        storeInfo,
        updateStoreInfoContext, // Cung cấp hàm cập nhật
        // --> THÊM CÁC HÀM FOLLOW VÀO VALUE <--
        followStore,
        unfollowStore,
        isFollowingStore,
        // --> KẾT THÚC THÊM <--
        user,
        setUser, // Cung cấp setUser
        loading,
        fetchUserData, // Cung cấp nếu cần gọi lại từ bên ngoài
        getUserCart,   // Cung cấp nếu cần gọi lại từ bên ngoài
        fetchStoreData // Cung cấp nếu cần gọi lại từ bên ngoài
    };
    // --- KẾT THÚC OBJECT VALUE ---

    // Log giá trị context để kiểm tra
    // console.log('CONTEXT PROVIDER VALUE:', value);

    return (
        <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
    );
};

export default ShopContextProvider;