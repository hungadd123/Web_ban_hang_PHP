import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
// Bỏ Title vì dùng CardTitle
// import Title from "../components/Title";
import Footer from "../components/Footer";

// Import Shadcn UI components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Thêm Skeleton cho loading

const StoreOrders = () => { // Có thể nhận props backendUrl, token nếu không dùng context trực tiếp
  const { backendUrl, token, storeInfo, currency } = useContext(ShopContext); // Lấy thêm currency
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStoreOrders = async () => {
    // Kiểm tra storeInfo._id trước khi fetch
    if (!storeInfo?._id) {
      // console.log("Store info not available yet.");
      // Không cần set lỗi ở đây vì useEffect sẽ chạy lại khi storeInfo có
      return;
    }
    setIsLoading(true);
    setError(null); // Reset lỗi trước mỗi lần fetch
    try {
      const response = await axios.get(
        `${backendUrl}/api/store-management/storeorders?storeId=${storeInfo._id}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        console.error("Error fetching orders:", response.data.message);
        setError(response.data.message || "Failed to fetch orders.");
        setOrders([]); // Clear orders on error
      }
    } catch (err) {
      console.error("API call error:", err);
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
      setOrders([]); // Clear orders on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch khi có token và storeInfo._id
    if (token && storeInfo?._id) {
      fetchStoreOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, storeInfo?._id]); // Thêm storeInfo._id vào dependency array

  // Helper function để lấy variant cho Badge dựa trên status
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success'; // Giả sử bạn có variant 'success' (màu xanh lá)
      case 'shipped':
        return 'default'; // Hoặc màu xanh dương
      case 'processing':
        return 'secondary'; // Màu xám hoặc vàng
      case 'cancelled':
        return 'destructive'; // Màu đỏ
      default:
        return 'outline'; // Mặc định
    }
  };


  return (
    // Bỏ max-padd-container và py-10 vì Card đã có padding riêng
    <Card>
      <CardHeader>
        <CardTitle>Store Orders</CardTitle>
        <CardDescription>View and manage recent orders for your store.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // --- Loading State ---
          <div className="space-y-2">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
           // --- Error State ---
           <p className="text-center text-destructive">Error loading orders: {error}</p>
        ) : orders.length > 0 ? (
          // --- Orders Table ---
          <Table>
            <TableCaption>A list of recent orders for your store.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Order ID</TableHead>
                <TableHead>User ID</TableHead> {/* Hoặc User Email nếu có */}
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium truncate w-[150px]">{order._id}</TableCell>
                  <TableCell>{order.userId}</TableCell> {/* Thay bằng order.user.email nếu có */}
                  <TableCell className="text-right">
                     {currency || '$'}{order.amount?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.paymentMethod || 'N/A'}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          // --- No Orders State ---
          <p className="text-center text-muted-foreground py-10">No orders found for your store yet.</p>
        )}
      </CardContent>
      {/* Có thể thêm CardFooter nếu cần pagination hoặc actions tổng */}
      {/* <CardFooter>
          <p>Pagination controls here...</p>
      </CardFooter> */}

      {/* Footer có thể không cần thiết nếu đây là một tab content */}
      <Footer />
    </Card>
  );
};

export default StoreOrders;