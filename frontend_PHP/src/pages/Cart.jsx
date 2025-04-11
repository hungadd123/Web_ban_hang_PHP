import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom"; // For empty cart link
import { ShopContext } from "../context/ShopContext";
import CartTotal from "../components/CartTotal"; // Use the refactored CartTotal
import Footer from "../components/Footer";

// Import Shadcn UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react"; // Use lucide-react icons
import { Badge } from "@/components/ui/badge"; // Optional: for item count

const Cart = () => {
  const { products, currency, cartItems, getCartCount, updateQuantity } =
    useContext(ShopContext);

  // --- Simplified Data Processing using useMemo ---
  const flattenedCart = useMemo(() => {
    if (!products || products.length === 0) return []; // Guard clause if products aren't loaded

    return Object.entries(cartItems)
      .flatMap(([productId, colors]) =>
        Object.entries(colors)
          .filter(([, quantity]) => quantity > 0) // Only items with quantity > 0
          .map(([color, quantity]) => {
            const product = products.find((p) => p._id === productId);
            // Return null if product not found, filter out later
            if (!product) return null;
            return {
              key: `${productId}-${color}`, // Unique key for React map
              productId,
              color,
              quantity,
              product, // Include full product data
            };
          })
      )
      .filter((item) => item !== null); // Filter out any items where product wasn't found
  }, [cartItems, products]);

  // Helper to format currency
  const formatCurrency = (amount) => {
    return `${currency || "$"}${amount?.toFixed(2) || "0.00"}`;
  };

  // --- Event Handlers (directly call context update) ---
  const handleIncrement = (productId, color) => {
    const currentQuantity = cartItems[productId]?.[color] || 0;
    updateQuantity(productId, color, currentQuantity + 1);
  };

  const handleDecrement = (productId, color) => {
    const currentQuantity = cartItems[productId]?.[color] || 0;
    if (currentQuantity > 1) {
      updateQuantity(productId, color, currentQuantity - 1);
    } else {
      // Optional: Remove item if quantity becomes 0 or less
      // updateQuantity(productId, color, 0);
    }
  };

  const handleRemove = (productId, color) => {
    updateQuantity(productId, color, 0); // Set quantity to 0 to remove
  };


  const cartItemCount = getCartCount(); // Get total item count

  return (
    <section className="min-h-screen"> {/* Ensure section takes at least screen height */}
      {/* Removed the top bg-primary section for a cleaner look */}
      <div className="max-padd-container py-12 md:py-16"> {/* Standard padding */}
        {/* --- Page Header --- */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {cartItemCount > 0 && (
             <Badge variant="outline" className="text-base px-3 py-1">
                {cartItemCount} Item{cartItemCount !== 1 ? 's' : ''}
             </Badge>
          )}
        </div>

        {flattenedCart.length > 0 ? (
          // --- Main Cart Layout (Table + Summary) ---
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* --- Cart Items Table (Takes 2 columns on large screens) --- */}
            <div className="lg:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] sm:w-[150px]">Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"> {/* For Remove button */} </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flattenedCart.map((item) => (
                    <TableRow key={item.key}>
                      {/* Product Image */}
                      <TableCell>
                        <img
                          src={item.product.image?.[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md aspect-square"
                        />
                      </TableCell>
                      {/* Product Details */}
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                           <span className="line-clamp-2">{item.product.name}</span>
                           <span className="text-xs text-muted-foreground capitalize">
                              Color: {item.color}
                           </span>
                        </div>
                      </TableCell>
                      {/* Price */}
                      <TableCell>{formatCurrency(item.product.price)}</TableCell>
                      {/* Quantity */}
                      <TableCell>
                         <div className="flex items-center justify-center gap-1 border border-border rounded-md p-1 w-fit mx-auto">
                            <Button
                               variant="ghost"
                               size="icon"
                               className="h-7 w-7 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                               onClick={() => handleDecrement(item.productId, item.color)}
                               disabled={item.quantity <= 1} // Disable if quantity is 1
                            >
                               <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                               {item.quantity}
                            </span>
                            <Button
                               variant="ghost"
                               size="icon"
                               className="h-7 w-7 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                               onClick={() => handleIncrement(item.productId, item.color)}
                            >
                               <Plus className="h-4 w-4" />
                            </Button>
                         </div>
                      </TableCell>
                      {/* Total Price per Item */}
                      <TableCell className="text-right">
                        {formatCurrency(item.product.price * item.quantity)}
                      </TableCell>
                      {/* Remove Button */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(item.productId, item.color)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* --- Cart Summary (Takes 1 column on large screens) --- */}
            <div className="lg:col-span-1">
              {/* Use the refactored CartTotal component */}
              <CartTotal />
              {/* The Checkout button is now inside CartTotal */}
            </div>
          </div>
        ) : (
          // --- Empty Cart View ---
          <div className="text-center py-20 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
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