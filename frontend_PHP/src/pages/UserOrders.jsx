import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertCircle, ShoppingBag, ArrowRight, Package, CreditCard,
    MapPin, X, CalendarDays, Hourglass, CheckCircle, XCircle, Store, Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "../components/Footer";
import OrderSummaryCard from "../components/OrderSummaryCard";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "../utils/helpers";

const Timeline = ({ children }) => ( <div className="relative pl-6 sm:pl-8">{children}</div> );
const TimelineItem = ({ children, isLast }) => ( <div className={`relative pb-8 ${ !isLast ? "after:absolute after:top-5 after:left-[calc(0.375rem-1px)] sm:after:left-[calc(0.5rem-1px)] after:w-0.5 after:h-full after:bg-border" : "" }`} > {children} </div> );
const TimelineDot = ({ icon, status }) => {
    const variant = getStatusBadgeVariant(status);
    let bgColor = "bg-gray-400";
    if (variant === "success") bgColor = "bg-green-500";
    else if (variant === "destructive") bgColor = "bg-red-500";
    else if (variant === "warning") bgColor = "bg-yellow-500";
    else if (variant === "processing" || status?.toLowerCase() === 'processing' || status?.toLowerCase() === 'out for delivery' || status?.toLowerCase() === 'in delivery') bgColor = "bg-blue-500";
    else if (variant === "secondary" || variant === 'default' || status?.toLowerCase() === 'paid' || status?.toLowerCase() === 'order placed' || status?.toLowerCase() === 'pending payment' || status?.toLowerCase() === 'waiting for pickup' ) bgColor = 'bg-gray-500';
    else bgColor = 'bg-primary';
    return ( <div className={`absolute top-1 -left-1.5 sm:-left-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-background ${bgColor}`} > {icon || <div className="w-2 h-2 bg-white rounded-full"></div>} </div> );
};
const TimelineContent = ({ children }) => ( <div className="ml-4 sm:ml-6">{children}</div> );
const getStatusIcon = (status) => {
    const lowerStatus = String(status || "").toLowerCase().trim();
    const iconClass = "w-4 h-4 text-white";
    if (lowerStatus === "delivered") return <CheckCircle className={iconClass} />;
    if (lowerStatus === "canceled" || lowerStatus === "payment failed") return <XCircle className={iconClass} />;
    if (lowerStatus === "processing" || lowerStatus === "out for delivery" || lowerStatus === 'in delivery') return <Hourglass className={`${iconClass} animate-spin-slow`} />;
    if (lowerStatus === "paid" || lowerStatus === "order placed" || lowerStatus === 'waiting for pickup') return <Package className={iconClass} />;
    if (lowerStatus === "pending payment") return <Clock className={iconClass} />;
    return <CalendarDays className={iconClass} />;
};

const OrderDetailsSheet = ({ order, isOpen, onClose, currencyCode, locale, delivery_charges }) => {
     if (!order) return null;

     const getImageSource = (product) => product?.thumbnail || '/placeholder-image.png';
     const subtotal = (order.total_amount ?? 0) - (delivery_charges ?? 0);

     return (
         <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
             <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden">
                 <SheetHeader className="border-b p-4 flex-shrink-0 dark:border-border">
                     <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                         <Package className="w-5 h-5 text-primary" /> Order Details
                     </SheetTitle>
                     <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                         <span>Order #{order.id}</span>
                         <Badge variant={getStatusBadgeVariant(order.shipping_status)} className="capitalize">
                             {order.shipping_status || 'N/A'}
                         </Badge>
                         <span className="text-muted-foreground">({formatDate(order.created_at, locale)})</span>
                     </SheetDescription>
                     <SheetClose asChild className="absolute top-3 right-3">
                         <Button variant="ghost" size="icon"> <X className="h-5 w-5" /> <span className="sr-only">Close</span> </Button>
                     </SheetClose>
                 </SheetHeader>

                 <div className="p-5 overflow-y-auto space-y-6 flex-grow">
                     <section>
                         <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                             <ShoppingBag className="w-5 h-5 text-muted-foreground" /> Items ({order.order_details?.length || 0})
                         </h3>
                         <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                             {order.order_details && order.order_details.length > 0 ? (
                                 order.order_details.map((item, index) => (
                                     <React.Fragment key={item.id || index}>
                                         <div className="flex items-start gap-3">
                                             <img
                                                 src={item.product?.thumbnail || '/placeholder-image.png'}
                                                 alt={item.product?.productName || 'Product image'}
                                                 className="w-16 h-16 rounded-md object-cover border bg-muted flex-shrink-0 dark:border-border"
                                                 loading="lazy"
                                                 onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                                             />
                                             <div className="flex-grow text-sm space-y-0.5">
                                                 <p className="font-medium text-foreground line-clamp-2">{item.product?.productName || "Unnamed Product"}</p>
                                                 <p className="text-muted-foreground text-xs">Qty: {item.quantity || 1}</p>
                                             </div>
                                             {item.product?.id &&
                                                 <Button variant="link" size="sm" asChild className="ml-auto self-start h-auto p-0 text-primary hover:text-primary/80 text-xs">
                                                     <Link to={`/product/${item.product.id}`}>View</Link>
                                                 </Button>
                                             }
                                         </div>
                                     </React.Fragment>
                                 ))
                             ) : ( <p className="text-muted-foreground text-sm">No item details available.</p> )}
                         </div>
                     </section>
                     <Separator />
                      <section>
                          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                             <Store className="w-5 h-5 text-muted-foreground" /> Store Information
                          </h3>
                          {order.store ? (
                              <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border dark:border-border">
                                       <AvatarImage src={order.store.avatar || "/default_store_logo.png"} alt={order.store.storeName} />
                                       <AvatarFallback><Package /></AvatarFallback>
                                   </Avatar>
                                   <div>
                                       <p className="text-sm font-medium text-foreground">{order.store.storeName || 'N/A'}</p>
                                       <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary hover:text-primary/80 text-xs">
                                           <Link to={`/store/${order.store.id}`}>Visit Store</Link>
                                       </Button>
                                   </div>
                              </div>
                           ) : (
                               <p className="text-sm text-muted-foreground">Store information unavailable.</p>
                           )}
                      </section>
                     <Separator />
                     <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         <div className="space-y-2">
                             <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                                 <CreditCard className="w-5 h-5 text-muted-foreground" /> Summary
                             </h3>
                             <div className="text-sm space-y-1 text-muted-foreground">
                                 <div className="flex justify-between"><span>Subtotal:</span><span className="text-foreground">{formatCurrency(subtotal >= 0 ? subtotal : 0, currencyCode, locale)}</span></div>
                                  <div className="flex justify-between"><span>Shipping:</span> <span className="text-foreground">{formatCurrency(delivery_charges, currencyCode, locale)}</span></div>
                                 <Separator className="my-1.5" />
                                 <div className="flex justify-between font-bold text-base text-foreground"><span>Total:</span><span>{formatCurrency(order.total_amount, currencyCode, locale)}</span></div>
                                 <p className="pt-1">
                                     Payment:
                                     <span className="font-medium text-foreground capitalize ml-1">{order.paymentMethod || "N/A"}</span>
                                     <span className={`font-medium ml-1.5 px-1.5 py-0.5 rounded text-xs ${order.payment_status === true ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`} >
                                         {order.payment_status === true ? "Paid" : "Pending"}
                                     </span>
                                 </p>
                             </div>
                         </div>
                         <div className="space-y-1">
                             <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                                 <MapPin className="w-5 h-5 text-muted-foreground" /> Shipping To
                             </h3>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                  <p className="font-medium text-foreground">{order.shipping_first_name} {order.shipping_last_name}</p>
                                  <p>{order.shipping_street}</p>
                                  <p>{order.shipping_city}{(order.shipping_city && order.shipping_state) ? ", " : ""} {order.shipping_state} {order.shipping_zipcode}</p>
                                  <p>{order.shipping_country}</p>
                                  {order.phoneNumber && <p>Phone: {order.phoneNumber}</p>}
                                  {order.note && <p className="mt-2 pt-2 border-t border-border text-xs italic">Note: {order.note}</p>}
                              </div>
                         </div>
                     </section>
                 </div>
             </SheetContent>
         </Sheet>
     );
 };


const UserOrders = () => {
    const CURRENCY_CODE = 'VND'; // Đổi lại nếu cần
    const LOCALE = 'vi-VN';     // Đổi lại nếu cần

    const { backendUrl, token, delivery_charges } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!token) { setError("Please log in to view your orders."); setIsLoading(false); return; }

        try {
            const response = await axios.get(`${backendUrl}/api/order/`, { // Sửa endpoint
                headers: { Authorization: `Bearer ${token}` } // Sửa header
            });

            if (response.data.success && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders); // Backend đã sort, không cần sort/map lại
            } else {
                setError(response.data?.message || "Failed to load orders.");
                setOrders([]);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            let errorMessage = "An unexpected error occurred while fetching your orders.";
            if (axios.isAxiosError(err) && err.response) { errorMessage = err.response.data?.message || err.message; }
            else if (err instanceof Error) { errorMessage = err.message; }
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
        setIsPanelOpen(true);
    }, []);

    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false);
         // Có thể bỏ delay nếu không cần hiệu ứng phức tạp khi đóng
         // const timer = setTimeout(() => setSelectedOrder(null), 300);
         // return () => clearTimeout(timer);
    }, []);


    const renderContent = () => {
        if (isLoading) {
            return ( <div className="space-y-4"> {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-36 w-full rounded-lg" /> ))} </div> );
        }
        if (error) {
            return ( <Alert variant="destructive" className="max-w-xl mx-auto"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Loading Orders</AlertTitle> <AlertDescription> {error} <div className="mt-4 flex gap-2"> <Button onClick={fetchOrders} size="sm">Retry</Button> <Button variant="outline" size="sm" asChild><Link to="/">Go Home</Link></Button> </div> </AlertDescription> </Alert> );
        }
        if (orders.length === 0) {
            return ( <div className="text-center py-20 px-6 flex flex-col items-center gap-5 border border-dashed rounded-lg max-w-md mx-auto bg-card dark:border-border"> <CalendarDays className="w-20 h-20 text-gray-300 dark:text-gray-600" /> <h2 className="text-2xl font-semibold text-foreground"> Your Order History is Empty </h2> <p className="text-muted-foreground"> Looks like you haven't placed any orders yet. </p> <Button asChild size="lg" className="mt-4"> <Link to="/"> <ShoppingBag className="mr-2 h-5 w-5" /> Start Shopping </Link> </Button> </div> );
        }
        return (
            <Timeline>
                {orders.map((order, index) => (
                    <TimelineItem key={order.id} isLast={index === orders.length - 1} >
                        <TimelineDot status={order.shipping_status} icon={getStatusIcon(order.shipping_status)} />
                        <TimelineContent>
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


    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-black/20">
            <main className="flex-grow container mx-auto max-w-4xl py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl lg:text-4xl font-extrabold mb-10 lg:mb-12 text-center text-foreground tracking-tight">
                    My Orders
                </h1>
                <div className="max-w-3xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            <OrderDetailsSheet
                order={selectedOrder}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                currencyCode={CURRENCY_CODE}
                locale={LOCALE}
                delivery_charges={delivery_charges}
            />

            <Footer />
        </div>
    );
};

export default UserOrders;