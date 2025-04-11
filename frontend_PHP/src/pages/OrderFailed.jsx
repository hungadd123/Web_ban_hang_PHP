import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Title from "../components/Title";

const OrderFailed = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100">
      <div className="max-w-lg bg-white p-6 rounded shadow-md">
        <Title 
          title1="Thanh toán" 
          title2="Thất bại" 
          titleStyles="text-center text-2xl font-bold" 
        />
        <p className="text-center mt-4 text-lg text-red-700">
          Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/place-order" className="btn-secondary">
            Thử lại thanh toán
          </Link>
          <Link to="/contact" className="btn-secondary">
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderFailed;
