import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId"); // Lấy orderId từ URL
    const reason = searchParams.get("reason"); // Lấy lý do (nếu có)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center max-padd-container py-16">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderId && (
                <p className="text-muted-foreground">
                    Your Order ID is: <span className="font-medium text-foreground">#{orderId}</span>
                 </p>
             )}
             {reason === 'already_processed' && (
                 <p className="text-sm text-yellow-600 dark:text-yellow-400">This order status was already updated.</p>
             )}
            <p className="text-muted-foreground">
              Your order has been placed successfully and is being processed.
            </p>
            <p className="text-muted-foreground">
              You can track your order status in the "My Orders" section.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                 <Button asChild className="w-full sm:w-auto group">
                     <Link to="/"> <Package className="mr-2 h-4 w-4"/> Back to Homepage</Link>
                 </Button>
                 <Button variant="outline" asChild className="w-full sm:w-auto">
                   <Link to="/orders">View My Orders</Link>
                 </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;