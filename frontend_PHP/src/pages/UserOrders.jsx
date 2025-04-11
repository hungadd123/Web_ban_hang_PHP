import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // Needed for links inside components
import axios from "axios";

// --- Context ---
import { ShopContext } from "../context/ShopContext"; // Assuming provides token, backendUrl

// --- UI Components (Shadcn/ui or equivalent) ---
// Make sure you have installed/added these components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose, // Giữ lại DialogClose
    // DialogFooter, // Nếu cần
    // DialogTrigger, // Không cần vì mở bằng state
} from "@/components/ui/dialog"; // <<< THAY ĐỔI

// --- Icons (from lucide-react) ---
// Make sure lucide-react is installed
import {
    AlertCircle,
    ShoppingBag,
    ArrowRight,
    Package,
    CreditCard,
    MapPin,
    X,
    CalendarDays,
    Hourglass,
    CheckCircle,
    XCircle,
} from "lucide-react";

// --- Components ---
import Footer from "../components/Footer";
// Removed Title component import, using simple <h1> for flexibility
// import OrderDetail from "../components/OrderDetail"; // Replaced by OrderDetailsDrawer

// --- Utilities (Using the helpers file defined previously) ---
import {
    formatCurrency,
    formatDate,
    getStatusBadgeVariant,
} from "../utils/helpers"; // Adjust path if necessary

// --- Custom Timeline Components (Consider extracting) ---
// (Copied from previous example - ensure these styles work with your setup)
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
    const variant = getStatusBadgeVariant(status);
    let bgColor = "bg-gray-400"; // Default
    if (variant === "success") bgColor = "bg-green-500";
    else if (variant === "destructive") bgColor = "bg-red-500";
    else if (variant === "warning") bgColor = "bg-yellow-500";
    else if (variant === "processing" || status?.toLowerCase() === 'processing' || status?.toLowerCase() === 'out for delivery') bgColor = "bg-blue-500";
    else if (variant === "secondary" || variant === 'default') bgColor = 'bg-gray-500';
    else bgColor = 'bg-primary'; // Fallback to primary for 'default' variant

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
const getStatusIcon = (status) => {
    const lowerStatus = String(status || "").toLowerCase().trim();
    const iconClass = "w-4 h-4 text-white";

    if (lowerStatus === "delivered") return <CheckCircle className={iconClass} />;
    if (lowerStatus === "cancelled" || lowerStatus === "failed") return <XCircle className={iconClass} />;
    if (lowerStatus === "processing" || lowerStatus === "out for delivery") return <Hourglass className={`${iconClass} animate-spin-slow`} />;
    if (lowerStatus === "paid" || lowerStatus === "order placed") return <Package className={iconClass} />;
    return <CalendarDays className={iconClass} />; // Default
};


// --- Order Summary Card Component (Adapted) ---
const OrderSummaryCard = React.memo(({ order, onSelectOrder, currencyCode, locale }) => (
    <div className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                {/* Info Left */}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                        {formatDate(order.date, locale)} {/* Pass locale */}
                    </p>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Order #{order._id.slice(-6)}
                    </h3>
                    <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        size="sm"
                        className="capitalize !mt-1.5"
                    >
                        {order.status || "Unknown"}
                    </Badge>
                </div>
                {/* Info Right & Action */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                    <p className="text-lg font-bold text-primary">
                        {/* Use currencyCode and locale */}
                        {formatCurrency(order.amount, currencyCode, locale)}
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
            {/* Optional: Product image previews */}
            {order.items && order.items.length > 0 && (
                <div className="mt-3 pt-3 border-t flex space-x-2 overflow-x-auto">
                    {order.items.slice(0, 4).map((item, idx) => (
                         <img
                            key={item._id || idx}
                            // Assuming item might have an 'image' field directly or nested
                            src={item.image?.[0] || '/placeholder-image.png'}
                            alt={item.name || item.productId?.name || 'Product'}
                            className="w-10 h-10 rounded object-cover border flex-shrink-0 bg-muted"
                            loading="lazy"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
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

// --- Order Details Drawer Component (Adapted) ---
// (Similar to previous example, ensure props match)
const OrderDetailsPanel = ({ order, isOpen, onClose, currencyCode, locale }) => {
    if (!order) return null;

    // Function to clean color string (giữ nguyên)
    const cleanColor = (colorStr) => {
      return typeof colorStr === 'string' ? colorStr.replace(/['"]+/g, '') : colorStr;
    };

    return (
        // Sử dụng Dialog thay vì Drawer
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="fixed h-full w-full max-w-lg border-l bg-background p-0 outline-none flex flex-col gap-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none duration-300"> {/* <<< THAY ĐỔI VÀ THÊM CLASS */}
                <DialogHeader className="border-b p-4 flex-shrink-0"> {/* Thêm flex-shrink-0 */}
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" /> Order Details
                    </DialogTitle>
                    <DialogDescription>
                        Order #{order._id}{" "}
                        <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="ml-2 capitalize"
                        >
                            {order.status}
                        </Badge>
                    </DialogDescription>
                    {/* DialogClose vẫn dùng để tạo nút đóng */}
                    <DialogClose asChild className="absolute top-3 right-3">
                        {/* <Button variant="ghost" size="icon">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button> */}
                    </DialogClose>
                </DialogHeader>

                {/* Nội dung có thể cuộn */}
                <div className="p-5 overflow-y-auto space-y-6 flex-grow">
                    {/* Items Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" /> Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-4 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-350px)] overflow-y-auto pr-2"> {/* Giới hạn chiều cao tương đối */}
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <React.Fragment key={item._id || index}>
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={item.image?.[0] || '/placeholder-image.png'}
                                                alt={item.name || 'Product image'}
                                                className="w-16 h-16 rounded-md object-cover border bg-muted flex-shrink-0"
                                                loading="lazy"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                                            />
                                            <div className="flex-grow text-sm space-y-0.5">
                                                <p className="font-medium text-foreground line-clamp-2">
                                                    {item.name || "Unnamed Product"}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Qty: {item.quantity || 1}
                                                    {item.color && <span className="ml-2 pl-2 border-l">Color: {cleanColor(item.color)}</span>}
                                                    {item.size && <span className="ml-2 pl-2 border-l">Size: {item.size}</span>}
                                                </p>
                                                <p className="text-foreground font-semibold pt-0.5">
                                                     {formatCurrency(item.price, currencyCode, locale)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                asChild
                                                className="ml-auto self-start h-auto p-0 text-primary hover:text-primary/80 text-xs"
                                            >
                                                <Link to={`/product/${item._id}`}>View</Link>
                                            </Button>
                                        </div>
                                        {index < order.items.length - 1 && <Separator className="my-3" />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">No item details available.</p>
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
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>{" "}
                                    <span className="text-foreground">
                                        {formatCurrency(order.amount, currencyCode, locale)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span> <span className="text-foreground">Free</span> {/* Adjust if needed */}
                                </div>
                                <Separator className="my-1.5" />
                                <div className="flex justify-between font-bold text-base text-foreground">
                                    <span>Total:</span>{" "}
                                    <span>{formatCurrency(order.amount, currencyCode, locale)}</span>
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
                             {order.address && (order.address.firstName || order.address.street) ? (
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    <p className="font-medium text-foreground">
                                         {order.address.firstName || ''} {order.address.lastName || ''}
                                    </p>
                                    <p>{order.address.street || ''}</p>
                                    <p>
                                        {order.address.city || ''}
                                        {(order.address.city && order.address.state) ? ", " : ""}
                                        {order.address.state || ''} {order.address.zipcode || ''}
                                    </p>
                                    <p>{order.address.country || ''}</p>
                                    {order.address.phone && <p>Phone: {order.address.phone}</p>}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Address details not available.</p>
                            )}
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
};


// --- Main Upgraded UserOrders Component ---
const UserOrders = () => {
    const CURRENCY_CODE = 'USD';
    const LOCALE = 'en-US'; // or 'vi-VN'

    const { backendUrl, token } = useContext(ShopContext);

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Đổi tên state cho rõ ràng

    // Renamed function to match component name convention
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (!token) {
            setError("Please log in to view your orders.");
            setIsLoading(false);
            return;
        }

        try {
            // Using GET request as in the original code
            const response = await axios.get(`${backendUrl}/api/order/userorder`, {
                headers: { token },
            });

            if (response.data.success && Array.isArray(response.data.orders)) {
                // Reverse directly here or sort by date descending for clarity
                 const sortedOrders = response.data.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
                 // No need to pre-select an order for the drawer view
                // if (sortedOrders.length > 0) {
                //     setSelectedOrder(sortedOrders[0]);
                // }
            } else {
                setError(response.data.message || "Failed to load orders.");
                setOrders([]);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
             let errorMessage = "An unexpected error occurred while fetching your orders.";
             if (axios.isAxiosError(err) && err.response) {
                 errorMessage = err.response.data?.message || err.message;
             } else if (err instanceof Error) {
                 errorMessage = err.message;
             }
            setError(errorMessage);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl, token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSelectOrder = useCallback((order) => {
        setSelectedOrder(order);
        setIsPanelOpen(true); // Mở panel
    }, []);

    const handleClosePanel = useCallback(() => { // Đổi tên hàm xử lý đóng
        setIsPanelOpen(false);
        const timer = setTimeout(() => setSelectedOrder(null), 300); // Delay để animation hoàn thành
        return () => clearTimeout(timer);
    }, []);

    // --- Rendering Logic ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <Timeline>
                    {[...Array(3)].map((_, i) => (
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

        if (error) {
            return (
                <Alert variant="destructive" className="max-w-xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Orders</AlertTitle>
                    <AlertDescription>
                        {error}
                        <div className="mt-4 flex gap-2">
                           <Button onClick={fetchOrders} size="sm">Retry</Button>
                           {/* Optional: Link to home */}
                           <Button variant="outline" size="sm" asChild>
                               <Link to="/">Go Home</Link>
                           </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            );
        }

        if (orders.length === 0) {
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

        // Display Orders Timeline
        return (
            <Timeline>
                {orders.map((order, index) => (
                    <TimelineItem
                        key={order._id}
                        isLast={index === orders.length - 1}
                    >
                        <TimelineDot
                            status={order.status}
                            icon={getStatusIcon(order.status)}
                        />
                        <TimelineContent>
                            {/* Render the summary card */}
                            <OrderSummaryCard
                                order={order}
                                onSelectOrder={handleSelectOrder}
                                currencyCode={CURRENCY_CODE}
                                locale={LOCALE}
                            />
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        );
    };

    // --- Component Return ---
    return (
         // Using background from previous example, adjust if needed
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
             {/* Use container for padding and max-width */}
            <main className="flex-grow container mx-auto max-w-7xl py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                 <h1 className="text-3xl lg:text-4xl font-extrabold mb-10 lg:mb-12 text-center text-foreground tracking-tight">
                    My Order Journey
                </h1>

                 {/* Max width for the timeline itself */}
                <div className="max-w-3xl mx-auto">
                    {renderContent()}
                </div>
            </main>

             {/* Drawer sits outside the main flow */}
             <OrderDetailsPanel
                order={selectedOrder}
                isOpen={isPanelOpen} // Truyền state mở/đóng
                onClose={handleClosePanel} // Truyền hàm xử lý đóng
                currencyCode={CURRENCY_CODE}
                locale={LOCALE}
            />

            <Footer />
        </div>
    );
};

export default UserOrders;