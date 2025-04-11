// src/components/admin/OrderDetailsPanel.jsx (Hoặc tên khác)
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ShoppingBag, Package, CreditCard, MapPin, X } from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "../../utils/helpers"; // Điều chỉnh đường dẫn

const OrderDetailsPanel = ({ order, isOpen, onClose, currencyCode, locale }) => {
    if (!order) return null;

    const cleanColor = (colorStr) => typeof colorStr === 'string' ? colorStr.replace(/['"]+/g, '') : colorStr;
    const getImageSource = (imageData) => (Array.isArray(imageData) && imageData.length > 0) ? imageData[0] : '/placeholder-image.png';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="fixed inset-y-0 right-0 h-full w-full max-w-lg border-l bg-background p-0 outline-none flex flex-col gap-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none duration-300">
                <DialogHeader className="border-b p-4 flex-shrink-0">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" /> Order Details
                    </DialogTitle>
                    <DialogDescription>
                        Order #{order._id.slice(-6).toUpperCase()}{" "}
                        <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2 capitalize">
                            {order.status}
                        </Badge>
                    </DialogDescription>
                    <DialogClose asChild className="absolute top-3 right-3">
                        <Button variant="ghost" size="icon"> <X className="h-5 w-5" /> <span className="sr-only">Close</span> </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="p-5 overflow-y-auto space-y-6 flex-grow">
                    {/* Items Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" /> Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2"> {/* Tăng chiều cao một chút */}
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <React.Fragment key={item._id || index}>
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={getImageSource(item.image)} // Dùng hàm helper
                                                alt={item.name || 'Product image'}
                                                className="w-16 h-16 rounded-md object-cover border bg-muted flex-shrink-0"
                                                loading="lazy"
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                                            />
                                            <div className="flex-grow text-sm space-y-0.5">
                                                <p className="font-medium text-foreground line-clamp-2">{item.name || "Unnamed Product"}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Qty: {item.quantity || 1}
                                                    {item.color && <span className="ml-2 pl-2 border-l">Color: {cleanColor(item.color)}</span>}
                                                    {/* Thêm size nếu có trong model item */}
                                                    {/* {item.size && <span className="ml-2 pl-2 border-l">Size: {item.size}</span>} */}
                                                </p>
                                                <p className="text-foreground font-semibold pt-0.5">{formatCurrency(item.price, currencyCode, locale)}</p>
                                            </div>
                                            {/* Link đến trang sản phẩm nếu có item._id */}
                                            <Button variant="link" size="sm" asChild className="ml-auto self-start h-auto p-0 text-primary hover:text-primary/80 text-xs">
                                                <Link to={`/product/${item._id}`}>View</Link>
                                            </Button>
                                        </div>
                                        {index < order.items.length - 1 && <Separator className="my-3" />}
                                    </React.Fragment>
                                ))
                            ) : ( <p className="text-muted-foreground text-sm">No item details available.</p> )}
                        </div>
                    </section>
                    <Separator />
                    {/* Summary & Address Section */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       {/* Summary */}
                       <div className="space-y-2">
                            {/* ... (Giữ nguyên phần Summary) ... */}
                       </div>
                       {/* Shipping Address */}
                       <div className="space-y-1">
                            {/* ... (Giữ nguyên phần Address) ... */}
                       </div>
                    </section>
                    {/* Optional: Tracking Link */}
                    {/* ... (Giữ nguyên nếu có) ... */}
                </div>
            </DialogContent>
        </Dialog>
    );
};
