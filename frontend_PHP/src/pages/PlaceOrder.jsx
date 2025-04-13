import React, { useContext, useState, useEffect, useCallback } from "react";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
    const [method, setMethod] = useState("cod");
    const [isLoading, setIsLoading] = useState(false);
    const {
        navigate,
        products,
        delivery_charges,
        cartItems,
        setCartItems,
        getCartAmount,
        token,
        backendUrl,
    } = useContext(ShopContext);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", street: "",
        city: "", state: "", zipcode: "", country: "", phone: "", note: ""
    });

    useEffect(() => {
        if (!token) {
            toast.info("Please log in to place an order.");
            navigate('/login');
        } else if (Object.keys(cartItems).length === 0 && products.length > 0) {
             const timer = setTimeout(() => {
                 if (getCartAmount() === 0) {
                     toast.info("Your cart is empty.");
                     navigate('/cart');
                 }
             }, 300); // Delay check slightly
             return () => clearTimeout(timer);
        }
    }, [token, cartItems, products, getCartAmount, navigate]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData((data) => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

         for (const key in formData) {
            if (key !== 'note' && !formData[key]) {
                 const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                 toast.error(`Please fill in the ${fieldName} field.`);
                 return;
             }
         }

        if (getCartAmount() === 0) {
             toast.error("Cannot place order with an empty cart.");
             navigate('/cart');
             return;
        }

        setIsLoading(true);

        const addressData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipcode: formData.zipcode,
        };

        let orderItems = [];
        let storeId = null;
        let allProductsFound = true;
        for (const productId in cartItems) {
            if (cartItems[productId] > 0) {
                const productData = products.find((product) => String(product.id) === productId);
                if (!productData) {
                     toast.error(`Product details not found for ID ${productId}. Please refresh or contact support.`);
                     allProductsFound = false;
                     break;
                }
                 if (!productData.store_id) {
                     toast.error(`Store information missing for product: ${productData.productName}`);
                      allProductsFound = false;
                     break;
                 }
                 if (storeId === null) {
                     storeId = productData.store_id;
                 } else if (storeId !== productData.store_id) {
                     toast.error("All products must be from the same store. Please place separate orders.");
                      allProductsFound = false;
                     break;
                 }

                 const backendItemFormat = {
                    product_id: productData.id,
                    quantity: cartItems[productId],
                    store_id: productData.store_id
                 }
                 orderItems.push(backendItemFormat);
            }
        }

        if (!allProductsFound || orderItems.length === 0 || storeId === null) {
             if (orderItems.length === 0 && allProductsFound) {
                 toast.error("Your cart seems empty or product data is invalid.");
             }
            setIsLoading(false);
            return;
        }

        const orderData = {
            shipping_address: addressData,
            selectedItems: orderItems,
            amount: getCartAmount() + delivery_charges,
            store_id: storeId,
            paymentMethod: method === 'cod' ? 'COD' : 'BANKING',
            phoneNumber: formData.phone,
            note: formData.note,
        };

        try {
             const endpoint = `${backendUrl}/api/order/create`;
             const response = await axios.post(endpoint, orderData, { headers: { Authorization: `Bearer ${token}` } });

             if (response.data?.success) {
                 setCartItems({}); // Clear cart trước khi điều hướng/redirect
                 if (response.data.redirectUrl) {
                    window.location.replace(response.data.redirectUrl);
                 } else {
                     navigate("/order-success");
                 }
             } else {
                 if (response.data?.errors) {
                     const errorMessages = Object.values(response.data.errors).flat().join('\n');
                     toast.error(`Validation failed:\n${errorMessages}`);
                 } else {
                      toast.error(response.data?.message || "Failed to place order.");
                 }
             }
        } catch (error) {
            console.error("Order submission error:", error);
             const errorData = error.response?.data;
             if (errorData?.errors) {
                 const errorMessages = Object.values(errorData.errors).flat().join('\n');
                 toast.error(`Validation failed:\n${errorMessages}`);
             } else {
                 toast.error(errorData?.message || error.message || "An error occurred while placing the order.");
             }
        } finally {
             setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen">
            <form onSubmit={onSubmitHandler} className="max-padd-container py-12 md:py-16">
               <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                                <CardDescription>Please enter your shipping details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={onChangeHandler} required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="johndoe@example.com" value={formData.email} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                     <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 890" value={formData.phone} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="street">Street Address</Label>
                                        <Input id="street" name="street" placeholder="123 Main St" value={formData.street} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" placeholder="Anytown" value={formData.city} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input id="state" name="state" placeholder="State" value={formData.state} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="zipcode">Zip / Postal Code</Label>
                                        <Input id="zipcode" name="zipcode" placeholder="10001" value={formData.zipcode} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="country">Country</Label>
                                        <Input id="country" name="country" placeholder="Country" value={formData.country} onChange={onChangeHandler} required disabled={isLoading}/>
                                    </div>
                                     <div className="md:col-span-2 space-y-1.5">
                                        <Label htmlFor="note">Order Note (Optional)</Label>
                                        <Textarea id="note" name="note" placeholder="Add any special instructions here..." value={formData.note} onChange={onChangeHandler} disabled={isLoading} className="min-h-[80px]"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <CartTotal />
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>Select how you want to pay.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
                                    <div className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                                        <RadioGroupItem value="vnpay" id="vnpay" />
                                        <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                                            <span className="font-medium">VNPay Gateway</span>
                                            <p className="text-xs text-muted-foreground">Pay securely via VNPay.</p>
                                        </Label>

                                    </div>
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


                        <Button type="submit" size="lg" className="w-full group" disabled={getCartAmount() === 0 || isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
                            {isLoading ? "Processing..." : "Place Order"}
                        </Button>
                    </div>

                </div>
            </form>
            <Footer />
        </div>
    );
};

export default PlaceOrder;