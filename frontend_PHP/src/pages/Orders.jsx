import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Context
import { ShopContext } from "../context/ShopContext"; // Assuming ShopContext provides token, backendUrl

// UI Components (Shadcn/ui or equivalent)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter, // Keep if needed, otherwise remove
    DrawerClose,
} from "@/components/ui/drawer";

// Icons (from lucide-react)
import {
    AlertCircle,
    PackageSearch, // Not used in the final code, consider removing if not needed elsewhere
    ShoppingBag,
    ArrowRight,
    Package,
    // User, // Not used directly in this cleaned version, needed if showing user info
    CreditCard,
    MapPin,
    X,
    CalendarDays,
    Hourglass,
    CheckCircle,
    XCircle,
} from "lucide-react";

// Components
import Footer from "../components/Footer";

// Utilities (Assume these are defined elsewhere and imported)
import {
    formatCurrency,
    formatDate,
    getStatusBadgeVariant, // Maps order status to badge variant ('default', 'destructive', 'outline', 'secondary', 'success', 'warning')
} from "../utils/helpers"; // Example path

// --- Custom Timeline Components (Consider extracting to separate files) ---

const Timeline = ({ children }) => (
    <div className="relative pl-6 sm:pl-8">{children}</div>
);

const TimelineItem = ({ children, isLast }) => (
    <div
        className={`relative pb-8 ${
            !isLast
                ? "after:absolute after:top-5 after:left-[calc(0.375rem-1px)] sm:after:left-[calc(0.5rem-1px)] after:w-0.5 after:h-full after:bg-border"
                : ""
        }`}
    >
        {children}
    </div>
);

const TimelineDot = ({ icon, status }) => {
    // Determine background color based on status using the badge variant logic for consistency
    const variant = getStatusBadgeVariant(status);
    let bgColor = "bg-gray-400"; // Default
    if (variant === "success") bgColor = "bg-green-500";
    else if (variant === "destructive") bgColor = "bg-red-500";
    else if (variant === "warning") bgColor = "bg-yellow-500";
    else if (variant === "processing" || status?.toLowerCase() === 'processing' || status?.toLowerCase() === 'out for delivery') bgColor = "bg-blue-500";
    else if (variant === "secondary" || variant === 'default') bgColor = 'bg-gray-500'; // Adjust as needed

    return (
        <div
            className={`absolute top-1 -left-1.5 sm:-left-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-background ${bgColor}`}
        >
            {icon || <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
    );
};

const TimelineContent = ({ children }) => (
    <div className="ml-4 sm:ml-6">{children}</div>
);

// --- Helper to get Status Icon ---
const getStatusIcon = (status) => {
    const lowerStatus = String(status || "").toLowerCase().trim();
    const iconClass = "w-4 h-4 text-white";

    if (lowerStatus === "delivered") return <CheckCircle className={iconClass} />;
    if (lowerStatus === "cancelled" || lowerStatus === "failed") return <XCircle className={iconClass} />;
    if (lowerStatus === "processing" || lowerStatus === "out for delivery") return <Hourglass className={`${iconClass} animate-spin-slow`} />; // Assumes animate-spin-slow is defined in CSS/Tailwind config
    if (lowerStatus === "paid" || lowerStatus === "order placed") return <Package className={iconClass} />;
    return <CalendarDays className={iconClass} />; // Default
};


// --- Order Summary Card Component ---
const OrderSummaryCard = React.memo(({ order, onSelectOrder, currencySymbol }) => (
    <div className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                {/* Info Left */}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                        {formatDate(order.date)}
                    </p>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Order #{order._id.slice(-6)}{" "}
                        {/* Using last 6 chars for a shorter ID */}
                    </h3>
                    <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        size="sm"
                        className="capitalize !mt-1.5" // !important might be needed depending on specificity
                    >
                        {order.status || "Unknown"}
                    </Badge>
                </div>

                {/* Info Right & Action */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                    <p className="text-lg font-bold text-primary">
                        {formatCurrency(order.amount, currencySymbol)}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectOrder(order)}
                    >
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Optional: Small product image previews */}
            {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t flex space-x-2 overflow-x-auto">
                    {order.items.slice(0, 4).map((item, idx) => (
                        <img
                            key={item._id || idx} // Use item._id if available, fallback to index
                            src={item.image?.[0] || "/placeholder-image.png"} // Use placeholder if no image
                            alt={item.name || "Product"}
                            className="w-10 h-10 rounded object-cover border flex-shrink-0 bg-muted"
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop if placeholder fails
                                e.target.src = "/placeholder-image.png";
                            }}
                        />
                    ))}
                    {order.items.length > 4 && (
                        <span className="text-xs self-center text-muted-foreground ml-1">
                            +{order.items.length - 4} more
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
));

// --- Order Details Drawer Component ---
const OrderDetailsDrawer = ({ order, isOpen, onClose, currencySymbol }) => {
    if (!order) return null;

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            direction="right"
        >
            <DrawerContent className="h-full w-full max-w-lg outline-none">
                {" "}
                {/* Adjust width as needed */}
                <DrawerHeader className="border-b p-4">
                    <DrawerTitle className="text-xl font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" /> Order Details
                    </DrawerTitle>
                    <DrawerDescription>
                        Order #{order._id}{" "}
                        <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="ml-2 capitalize"
                        >
                            {order.status}
                        </Badge>
                    </DrawerDescription>
                    <DrawerClose asChild className="absolute top-3 right-3">
                        <Button variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="p-5 overflow-y-auto space-y-6 flex-grow">
                    {/* Items Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" /> Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {" "}
                            {/* Scrollable items */}
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <React.Fragment key={item._id || index}>
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={item.image?.[0] || "/placeholder-image.png"}
                                                alt={item.name || "Product image"}
                                                className="w-16 h-16 rounded-md object-cover border bg-muted flex-shrink-0"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/placeholder-image.png";
                                                }}
                                            />
                                            <div className="flex-grow text-sm space-y-0.5">
                                                <p className="font-medium text-foreground line-clamp-2">
                                                    {item.name || "Unnamed Product"}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Qty: {item.quantity || 1}
                                                    {item.color && <span className="ml-2 pl-2 border-l">Color: {item.color}</span>}
                                                    {item.size && <span className="ml-2 pl-2 border-l">Size: {item.size}</span>}
                                                </p>
                                                <p className="text-foreground font-semibold pt-0.5">
                                                    {formatCurrency(item.price, currencySymbol)}
                                                </p>
                                            </div>
                                            {/* Link to product page if productId exists */}
                                            {item.productId && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    asChild
                                                    className="ml-auto self-start h-auto p-0 text-primary hover:text-primary/80 text-xs"
                                                >
                                                    <Link to={`/product/${item.productId}`}>View</Link>
                                                </Button>
                                            )}
                                        </div>
                                        {index < order.items.length - 1 && <Separator className="my-3" />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    No item details available.
                                </p>
                            )}
                        </div>
                    </section>

                    <Separator />

                    {/* Summary & Address Section */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Summary */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-muted-foreground" /> Summary
                            </h3>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                {/* Add subtotal, shipping, tax if available from API */}
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>{" "}
                                    <span className="text-foreground">
                                        {formatCurrency(order.amount, currencySymbol)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span> <span className="text-foreground">Free</span>{" "}
                                    {/* Assuming free, adjust if needed */}
                                </div>
                                {/* Add Tax row if applicable */}
                                <Separator className="my-1.5" />
                                <div className="flex justify-between font-bold text-base text-foreground">
                                    <span>Total:</span>{" "}
                                    <span>{formatCurrency(order.amount, currencySymbol)}</span>
                                </div>
                                <p className="pt-1">
                                    Payment:{" "}
                                    <span className="font-medium text-foreground capitalize">
                                        {order.paymentMethod || "N/A"}
                                    </span>
                                    <span
                                        className={`font-medium ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                                            order.payment
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        }`}
                                    >
                                        {order.payment ? "Paid" : "Pending"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-muted-foreground" /> Shipping To
                            </h3>
                            {order.address ? (
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    <p className="font-medium text-foreground">
                                        {order.address.firstName} {order.address.lastName}
                                    </p>
                                    <p>{order.address.street}</p>
                                    <p>
                                        {order.address.city}
                                        {order.address.city && order.address.state ? ", " : ""}
                                        {order.address.state} {order.address.zipcode}
                                    </p>
                                    <p>{order.address.country}</p>
                                    {order.address.phone && <p>Phone: {order.address.phone}</p>}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Address details not available.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Optional: Tracking Link */}
                    {order.trackingUrl && ( // Assuming API might provide a trackingUrl
                        <>
                            <Separator />
                            <Button asChild className="w-full">
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                                    Track Package <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </>
                    )}
                </div>

                {/* Optional Footer Actions */}
                {/* <DrawerFooter className="border-t p-4">
                     <Button variant="outline" onClick={onClose}>Close</Button>
                     Add other actions like "Reorder" or "Return Items" if applicable
                </DrawerFooter> */}
            </DrawerContent>
        </Drawer>
    );
};

const OrdersTimeline = () => {
    const { backendUrl, token } = useContext(ShopContext);
    // Example: Get currency from context or config, default to USD
    const currencySymbol = "$";

    const [orderData, setOrderData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Wrap data loading in useCallback to prevent recreation on every render
    const loadOrderData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        // Optionally clear data, or keep stale data while loading new
        // setOrderData([]);

        if (!token) {
            setError("Please log in to view your orders.");
            setIsLoading(false);
            return; // Stop execution if no token
        }

        try {
            const response = await axios.post(
                `${backendUrl}/api/order/userorder`,
                {}, // Empty body for POST as per original code
                { headers: { token } }
            );

            if (response.data.success && Array.isArray(response.data.orders)) {
                // Sort orders by date, newest first
                const sortedOrders = response.data.orders.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setOrderData(sortedOrders);
            } else {
                // Handle non-success API responses
                setError(response.data.message || "Failed to load orders.");
                setOrderData([]); // Clear data on failure
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            let errorMessage = "An unexpected error occurred while fetching your orders.";
            if (axios.isAxiosError(err) && err.response) {
                // Try to get more specific error from backend response
                errorMessage = err.response.data?.message || err.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setOrderData([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, token]); // Dependencies for useCallback

    useEffect(() => {
        loadOrderData();
    }, [loadOrderData]); // Run loadOrderData when the component mounts or dependencies change

    const handleSelectOrder = useCallback((order) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    }, []); // No dependencies, function doesn't change

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        // Delay clearing selected order for smoother closing animation
        const timer = setTimeout(() => setSelectedOrder(null), 300); // Match typical animation duration
        return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }, []);

    // --- Rendering Logic ---
    const renderContent = () => {
        // 1. Loading State
        if (isLoading) {
            return (
                <Timeline>
                    {[...Array(3)].map((_, i) => ( // Render 3 skeleton items
                        <TimelineItem key={`skeleton-${i}`} isLast={i === 2}>
                            <TimelineDot status="loading" />
                            <TimelineContent>
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            );
        }

        // 2. Error State
        if (error) {
            return (
                <Alert variant="destructive" className="max-w-xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Orders</AlertTitle>
                    <AlertDescription>
                        {error}
                        <div className="mt-4 flex gap-2">
                           <Button onClick={loadOrderData} size="sm">Retry</Button>
                           <Button variant="outline" size="sm" asChild>
                               <Link to="/">Go Home</Link>
                           </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            );
        }

        // 3. No Orders State
        if (orderData.length === 0) {
            return (
                <div className="text-center py-20 px-6 flex flex-col items-center gap-5 border border-dashed rounded-lg max-w-md mx-auto bg-card">
                    <CalendarDays className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                    <h2 className="text-2xl font-semibold text-foreground">
                        Your Order Timeline is Empty
                    </h2>
                    <p className="text-muted-foreground">
                        Looks like you haven't placed any orders yet.
                    </p>
                    <Button asChild size="lg" className="mt-4">
                        <Link to="/">
                            <ShoppingBag className="mr-2 h-5 w-5" /> Start Shopping
                        </Link>
                    </Button>
                </div>
            );
        }

        // 4. Display Orders Timeline
        return (
            <Timeline>
                {orderData.map((order, index) => (
                    <TimelineItem
                        key={order._id}
                        isLast={index === orderData.length - 1}
                    >
                        <TimelineDot
                            status={order.status}
                            icon={getStatusIcon(order.status)}
                        />
                        <TimelineContent>
                            <OrderSummaryCard
                                order={order}
                                onSelectOrder={handleSelectOrder}
                                currencySymbol={currencySymbol}
                            />
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        );
    };

    // --- Component Return ---
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
            <main className="flex-grow container mx-auto max-w-7xl py-12 md:py-16 px-4 sm:px-6 lg:px-8"> {/* Using container for standard padding/max-width */}
                <h1 className="text-3xl lg:text-4xl font-extrabold mb-10 lg:mb-12 text-center text-foreground tracking-tight">
                    My Order Journey
                </h1>

                {/* Max width container specifically for the timeline content */}
                <div className="max-w-3xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Drawer for Order Details - Rendered outside main content flow */}
            <OrderDetailsDrawer
                order={selectedOrder}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                currencySymbol={currencySymbol}
            />

            <Footer />
        </div>
    );
};

export default OrdersTimeline;