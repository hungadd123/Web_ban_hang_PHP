import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Cart = () => {
    const { products, currency, cartItems, getCartCount, updateQuantity, removeFromCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const flattenedCart = useMemo(() => {
        if (!products || products.length === 0) return [];
        return Object.entries(cartItems)
            .map(([productId, quantity]) => {
                 if (quantity <= 0) return null;
                 const product = products.find((p) => String(p.id) === productId);
                 if (!product) return null;
                 return {
                     key: productId,
                     productId,
                     quantity,
                     product,
                 };
             })
            .filter(item => item !== null);
     }, [cartItems, products]);

    const formatCurrency = (amount) => {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) return `${currency || '₫'}0 VND`;
        return `${currency || '₫'}${numericAmount.toLocaleString('vi-VN')} VND`;
    };

     const handleIncrement = (productId) => {
         const currentQuantity = cartItems[productId] || 0;
         updateQuantity(productId, currentQuantity + 1);
     };

     const handleDecrement = (productId) => {
         const currentQuantity = cartItems[productId] || 0;
         if (currentQuantity > 1) {
             updateQuantity(productId, currentQuantity - 1);
         } else {
             handleRemove(productId); // Remove if quantity is 1 or less
         }
     };

     const handleRemove = (productId) => {
         removeFromCart(productId);
     };

    const cartItemCount = getCartCount();

    return (
        <section className="min-h-screen flex flex-col">
            <div className="flex-grow max-padd-container py-12 md:py-16">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold">Shopping Cart</h1>
                  {cartItemCount > 0 && (
                      <Badge variant="outline" className="text-base px-3 py-1">
                          {cartItemCount} Item{cartItemCount !== 1 ? 's' : ''}
                      </Badge>
                  )}
                </div>

                {flattenedCart.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    <div className="lg:col-span-2 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] sm:w-[150px]">Product</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flattenedCart.map((item) => (
                                    <TableRow key={item.key}>
                                        <TableCell>
                                            <img
                                                src={item.product.thumbnail}
                                                alt={item.product.productName}
                                                className="w-16 h-16 object-cover rounded-md aspect-square border"
                                                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.png'; }}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                 <Link to={`/product/${item.productId}`} className="hover:text-secondary transition-colors duration-200 line-clamp-2">{item.product.productName}</Link>
                                                 {/* Removed color display */}
                                             </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.product.price)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1 border border-border rounded-md p-1 w-fit mx-auto">
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   className="h-7 w-7 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                                                   onClick={() => handleDecrement(item.productId)}
                                                   disabled={item.quantity <= 1}
                                                > <Minus className="h-4 w-4" /> </Button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   className="h-7 w-7 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                                                   onClick={() => handleIncrement(item.productId)}
                                                > <Plus className="h-4 w-4" /> </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(item.productId)}
                                                aria-label="Remove item"
                                            > <X className="h-4 w-4" /> </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="lg:col-span-1">
                        <CartTotal />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center border border-dashed rounded-lg bg-card">
                       <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4"/>
                       <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
                       <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
                       <Button asChild>
                           <Link to="/">Start Shopping</Link>
                       </Button>
                   </div>
                )}
            </div>
            <Footer />
        </section>
    );
};

export default Cart;