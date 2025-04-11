// src/components/ProtectedAdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'; // Điều chỉnh đường dẫn nếu cần
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react'; // Icon loading

const ProtectedAdminRoute = ({ children }) => {
    const { user, token, loading: contextLoading } = useContext(ShopContext);
    const location = useLocation();

    if (contextLoading && token) { // Chỉ show loading khi chắc chắn cần fetch user
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className='ml-2'>Checking authorization...</span>
            </div>
        );
    }

    if (!token) {
        toast.info("Please log in to access the admin area.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

   
    if (!user || user?.roleId?.roleName !== 'admin') {
        toast.error("Access Denied: Admin privileges required.");
        
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;