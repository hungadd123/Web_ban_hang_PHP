import React from 'react';
import Header from './components/Header';
import { Route, Routes } from "react-router-dom";
import Home from './pages/Home';
import Collection from './pages/Collection';
import Blog from './pages/Blog';
import Product from './pages/Product';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho Toastify
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import Login from './pages/Login';
// import Orders from './pages/Orders'; // Đã thay bằng UserOrders
import Verify from './pages/Verify';
import RequestStore from "./pages/RequestStore";
import StoreManagement from './pages/StoreManagement';
import OrderFailed from './pages/OrderFailed';
import OrderSuccess from './pages/OrderSuccess';
import UserOrders from './pages/UserOrders';
// import OrderDetailsPage from './pages/OrderDetailsPage'; // Chưa dùng
import StorePage from './pages/StorePage';
import UserProfile from './pages/UserProfile';

// --- Import Admin Components ---
import AdminLayout from './layouts/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute'; // Import component bảo vệ
import DashboardPage from './pages/admin/DashboardPage';
import ManageStoresPage from './pages/admin/ManageStoresPage';
import ManageProductsPage from './pages/admin/ManageProductsPage';
import ManageReviewsPage from './pages/admin/ManageReviewsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

// Bỏ export backend_url ở đây
// export const backend_url = import.meta.env.VITE_BACKEND_URL;

const App = () => {
    return (
        // Bỏ text-tertiary ở đây, để CSS global hoặc component tự xử lý
        <main>
            {/* Cấu hình ToastContainer tốt hơn */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" // Hoặc 'dark' hoặc 'colored'
            />
            {/* Header chỉ hiển thị cho các route không phải admin? Hoặc cần logic ẩn Header trong AdminLayout */}
            {/* Cách đơn giản là luôn hiển thị Header */}
             <Header />

            <Routes>
                {/* User Routes */}
                <Route path='/' element={<Home />} />
                <Route path="/request-store" element={<RequestStore />} />
                <Route path="/my-store" element={<StoreManagement />} />
                <Route path="/order-failed" element={<OrderFailed />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<UserOrders />} />
                <Route path="/store/:storeId" element={<StorePage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path='/collection' element={<Collection />} />
                <Route path='/blog' element={<Blog />} />
                <Route path='/product/:productId' element={<Product />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/place-order' element={<PlaceOrder />} />
                <Route path='/login' element={<Login />} />
                <Route path='/verify' element={<Verify />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedAdminRoute> 
                            <AdminLayout />     
                        </ProtectedAdminRoute>
                    }
                >
                    <Route index element={<DashboardPage />} /> 
                    <Route path="stores" element={<ManageStoresPage />} />
                    <Route path="products" element={<ManageProductsPage />} />
                     <Route path="reviews" element={<ManageReviewsPage />} /> 
                     <Route path="users" element={<ManageUsersPage />} /> 
                </Route>


                 {/* Optional: Route 404 */}
                 {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
        </main>
    );
}

export default App;