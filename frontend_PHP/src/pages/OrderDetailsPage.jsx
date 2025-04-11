import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OrderDetail from "../components/OrderDetail";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrderDetail = async () => {
    try {
      const response = await axios.get(`/api/order/details?orderId=${orderId}`);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  return (
    <div>
      {order ? <OrderDetail order={order} /> : <p className="text-center">Loading...</p>}
      <Footer />
    </div>
  );
};

export default OrderDetailsPage;
