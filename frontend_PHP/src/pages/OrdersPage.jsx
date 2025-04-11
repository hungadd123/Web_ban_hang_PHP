import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import Footer from "../components/Footer";
import OrderDetail from "../components/OrderDetail"; // Component hiển thị chi tiết đơn hàng
import { toast } from "react-toastify";

const OrdersPage = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Gọi API lấy danh sách đơn hàng của người dùng
  const fetchOrders = async () => {
    try {
      if (!token) return;
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        // Giả sử API trả về mảng đơn hàng, mỗi đơn hàng có trường items (mảng sản phẩm)
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-padd-container py-10">
        <Title title1="My" title2="Orders" titleStyles="text-2xl font-bold text-center mb-6" />
        <div className="flex flex-col md:flex-row gap-6">
          {/* Danh sách đơn hàng */}
          <div className="flex-1">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded-lg shadow mb-4 cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center gap-4">
                    {/* Hiển thị hình ảnh sản phẩm đầu tiên trong đơn hàng */}
                    <img
                      src={order.items[0]?.image[0]}
                      alt="order"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-bold">Order ID: {order._id}</p>
                      <p>Date: {new Date(order.date).toLocaleString()}</p>
                      <p>Status: {order.status}</p>
                      <p>
                        Amount: {currency}
                        {order.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No orders found.</p>
            )}
          </div>
          {/* Chi tiết đơn hàng */}
          {selectedOrder && (
            <div className="flex-1">
              <OrderDetail order={selectedOrder} />
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary mt-4"
              >
                Close Detail
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrdersPage;
