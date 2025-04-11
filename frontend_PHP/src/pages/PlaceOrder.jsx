import React, { useContext, useState } from "react";
// import Title from "../components/Title"; // Bỏ Title
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

// Import Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react"; // Icon cho nút Place Order

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod"); // "cod" or "vnpay"
  const {
    navigate,
    products,
    // currency, // Không cần trực tiếp vì CartTotal đã dùng
    delivery_charges,
    cartItems,
    setCartItems,
    getCartAmount,
    token,
    backendUrl,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", street: "",
    city: "", state: "", zipcode: "", country: "", phone: "",
  });

  // --- Giữ nguyên các hàm onChangeHandler và onSubmitHandler ---
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((data) => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        // Simple validation (kept for brevity, consider using react-hook-form + zod)
        for (const key in formData) {
            if (!formData[key]) {
                toast.error(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return;
            }
        }

        try {
            let orderItems = [];
            // Build order items
            for (const productId in cartItems) {
                for (const color in cartItems[productId]) {
                    if (cartItems[productId][color] > 0) {
                        const productData = products.find((product) => product._id === productId);
                        if (!productData || !productData.storeId) {
                            toast.error(`Product ${productData?.name || productId} is missing store information.`);
                            return;
                        }
                        // Avoid mutating productData from context if possible
                        const item = {
                           _id: productData._id,
                           name: productData.name,
                           price: productData.price,
                           image: productData.image, // Chỉ cần ảnh đầu tiên?
                           storeId: productData.storeId,
                           category: productData.category, // Thêm category nếu cần
                           color: color,
                           quantity: cartItems[productId][color],
                        };
                        orderItems.push(item);
                    }
                }
            }

            if (orderItems.length === 0) {
                toast.error("Your cart is empty.");
                navigate('/cart'); // Redirect back to cart
                return;
            }

            // Validate store IDs (kept)
            const storeIds = orderItems.map((item) => item.storeId);
            const uniqueStoreIds = Array.from(new Set(storeIds));
            if (uniqueStoreIds.length > 1) {
                toast.error("All products must be from the same store. Please place separate orders.");
                return;
            }
            if (!uniqueStoreIds[0]) {
                toast.error("Store information is missing for products.");
                return;
            }

            const orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_charges,
                storeId: uniqueStoreIds[0],
            };

            // --- Payment Processing ---
            if (method === "cod") {
                const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({}); // Clear cart on success
                    navigate("/order-success");
                } else {
                    toast.error(response.data.message || "Failed to place order.");
                }
            } else if (method === "vnpay") {
                const response = await axios.post(`${backendUrl}/api/order/vnpay`, orderData, { headers: { token } });
                if (response.data.success && response.data.vnpUrl) {
                    setCartItems({}); // Clear cart before redirecting
                    window.location.replace(response.data.vnpUrl); // Redirect to VNPay
                } else {
                    toast.error(response.data.message || "Failed to initiate VNPay payment.");
                }
            } else {
                toast.error("Invalid payment method selected.");
            }

        } catch (error) {
            console.error("Order submission error:", error);
            toast.error(error.response?.data?.message || error.message || "An error occurred while placing the order.");
        }
    };
  // --- Kết thúc các hàm xử lý ---


  return (
    // Bỏ div bg-primary, dùng layout chuẩn
    <div className="min-h-screen">
      <form onSubmit={onSubmitHandler} className="max-padd-container py-12 md:py-16">
         {/* Page Title */}
         <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

         {/* Main Layout Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

            {/* --- Left Column: Delivery Information --- */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                  <CardDescription>Please enter your shipping details.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={onChangeHandler} required />
                    </div>
                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={onChangeHandler} required />
                    </div>
                    {/* Email */}
                    <div className="md:col-span-2 space-y-1.5">
                       <Label htmlFor="email">Email Address</Label>
                       <Input id="email" name="email" type="email" placeholder="johndoe@example.com" value={formData.email} onChange={onChangeHandler} required />
                    </div>
                     {/* Street Address */}
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="street">Street Address</Label>
                      <Input id="street" name="street" placeholder="123 Main St" value={formData.street} onChange={onChangeHandler} required />
                    </div>
                    {/* City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="Anytown" value={formData.city} onChange={onChangeHandler} required />
                    </div>
                     {/* State/Province */}
                    <div className="space-y-1.5">
                       <Label htmlFor="state">State / Province</Label>
                       <Input id="state" name="state" placeholder="State" value={formData.state} onChange={onChangeHandler} required />
                    </div>
                    {/* Zip Code */}
                    <div className="space-y-1.5">
                       <Label htmlFor="zipcode">Zip / Postal Code</Label>
                       <Input id="zipcode" name="zipcode" placeholder="10001" value={formData.zipcode} onChange={onChangeHandler} required />
                    </div>
                    {/* Country */}
                    <div className="space-y-1.5">
                       <Label htmlFor="country">Country</Label>
                       <Input id="country" name="country" placeholder="Country" value={formData.country} onChange={onChangeHandler} required />
                    </div>
                    {/* Phone Number */}
                    <div className="md:col-span-2 space-y-1.5">
                       <Label htmlFor="phone">Phone Number</Label>
                       <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 890" value={formData.phone} onChange={onChangeHandler} required />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Right Column: Order Summary & Payment --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
               {/* Cart Total Summary */}
               <CartTotal />

               {/* Payment Method Card */}
               <Card>
                  <CardHeader>
                     <CardTitle>Payment Method</CardTitle>
                     <CardDescription>Select how you want to pay.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {/* Sử dụng RadioGroup */}
                     <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
                        {/* VNPay Option */}
                        <div className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                           <RadioGroupItem value="vnpay" id="vnpay" />
                           <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                              <span className="font-medium">VNPay Gateway</span>
                              <p className="text-xs text-muted-foreground">Pay securely via VNPay.</p>
                           </Label>
                           {/* Optional: Add VNPay logo */}
                           {/* <img src="/vnpay-logo.png" alt="VNPay" className="h-6"/> */}
                        </div>
                        {/* COD Option */}
                        <div className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                           <RadioGroupItem value="cod" id="cod" />
                           <Label htmlFor="cod" className="flex-1 cursor-pointer">
                              <span className="font-medium">Cash on Delivery</span>
                              <p className="text-xs text-muted-foreground">Pay when you receive the order.</p>
                           </Label>
                        </div>
                     </RadioGroup>
                  </CardContent>
               </Card>

               {/* Place Order Button */}
               {/* Đặt Button submit ở đây, bên ngoài các Card nhưng vẫn trong form */}
               <Button type="submit" size="lg" className="w-full group bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200" disabled={getCartAmount() === 0}> {/* Disable nếu giỏ hàng trống */}
                  Place Order
                  <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
               </Button>
            </div>

         </div>
      </form>
      <Footer />
    </div>
  );
};

export default PlaceOrder;