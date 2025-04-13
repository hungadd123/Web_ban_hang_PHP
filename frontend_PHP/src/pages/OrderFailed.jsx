import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle, Home } from "lucide-react";

const OrderFailed = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const reason = searchParams.get("reason");
    const code = searchParams.get("code"); // Mã lỗi từ VNPay nếu có

    let reasonMessage = "Payment was unsuccessful. Please try again or contact support.";
    if (reason === 'vnpay_fail') {
        reasonMessage = `VNPay payment failed or was cancelled${code ? ` (Code: ${code})` : ''}. Please try again.`;
    } else if (reason === 'order_not_found') {
        reasonMessage = "Could not find the corresponding order after payment attempt.";
    } else if (reason === 'invalid_signature') {
         reasonMessage = "Payment verification failed due to an invalid signature. Please contact support.";
    } else if (reason === 'config_error') {
         reasonMessage = "Payment processor configuration error. Please contact support.";
    } else if (reason === 'missing_hash') {
         reasonMessage = "Payment verification failed due to missing data. Please contact support.";
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center max-padd-container py-16">
                <Card className="w-full max-w-md text-center shadow-lg border-destructive">
                  <CardHeader className="items-center">
                    <XCircle className="h-16 w-16 text-destructive mb-4" />
                    <CardTitle className="text-2xl font-bold text-destructive">Payment Failed</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {orderId && (
                         <p className="text-muted-foreground">
                             Order ID: <span className="font-medium text-foreground">#{orderId}</span>
                          </p>
                      )}
                     <p className="text-muted-foreground">{reasonMessage}</p>

                     <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                          <Button asChild variant="outline" className="w-full sm:w-auto">
                              <Link to="/cart">Back to Cart</Link>
                          </Button>
                          <Button asChild className="w-full sm:w-auto">
                              <Link to="/"> <Home className="mr-2 h-4 w-4"/> Back to Homepage</Link>
                          </Button>
                          {/* Optional: Contact Support Button */}
                          {/* <Button variant="secondary" className="w-full sm:w-auto">Contact Support</Button> */}
                     </div>
                  </CardContent>
                </Card>
            </main>
             <Footer />
         </div>
    );
};

export default OrderFailed;