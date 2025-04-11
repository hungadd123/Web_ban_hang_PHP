import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
// import Title from "../components/Title"; // Bỏ Title component

// Import Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react"; // Import icon

const OrderSuccess = () => {
  return (
    // Cấu trúc layout chuẩn để Footer ở cuối trang
    <div className="min-h-screen flex flex-col">
      {/* Phần nội dung chính, co giãn và căn giữa */}
      <main className="flex-grow flex items-center justify-center max-padd-container py-16">
        {/* Sử dụng Card */}
        <Card className="w-full max-w-md text-center shadow-lg"> {/* Thêm shadow */}
          <CardHeader className="items-center"> {/* Căn giữa nội dung header */}
            {/* Icon thành công */}
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            {/* Tiêu đề */}
            <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
            {/* Mô tả */}
            <CardDescription className="text-base">
              Thank you for your purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4"> {/* Thêm khoảng cách */}
            <p className="text-muted-foreground">
              Your order has been placed successfully and is being processed.
            </p>
            <p className="text-muted-foreground">
              You can track your order status in the "My Orders" section.
            </p>
            {/* Nút về trang chủ */}
            <Button asChild className="w-full sm:w-auto group mt-4 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              <Link to="/">Back to Homepage</Link>
            </Button>
             {/* Optional: Link to My Orders page */}
             <Button variant="outline" asChild className="w-full sm:w-auto mt-2">
                <Link to="/orders">View My Orders</Link>
             </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;