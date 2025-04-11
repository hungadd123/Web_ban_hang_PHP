import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom"; // <--- 1. Import useNavigate

// Import Shadcn UI components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CartTotal = () => {
  const { currency, getCartAmount, delivery_charges } = useContext(ShopContext);
  const navigate = useNavigate(); // <--- 2. Khởi tạo hook useNavigate

  const subTotal = getCartAmount();
  const shipping = subTotal > 0 ? delivery_charges : 0;
  const total = subTotal + shipping;

  const formatCurrency = (amount) => {
    return `${currency || ''}${amount.toFixed(2)}`;
  };

  // --- 3. Handler cho nút Checkout ---
  const handleCheckout = () => {
    navigate('/place-order'); // Điều hướng đến trang PlaceOrder
  };

  return (
    <Card className="w-full top-24">
      <CardHeader>
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium text-foreground">{formatCurrency(subTotal)}</span>
        </div>
        <Separator />
        {/* Shipping Fee */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Shipping Fee:</span>
          <span className="font-medium text-foreground">{formatCurrency(shipping)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4">
        <Separator />
        {/* Total */}
        <div className="flex justify-between items-center w-full text-base font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {/* --- 4. Gắn onClick vào nút Checkout --- */}
        <Button
          className="w-full group bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          size="lg"
          disabled={subTotal === 0}
          onClick={handleCheckout} // <--- Gắn handler vào đây
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CartTotal;