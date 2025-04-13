import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "../utils/helpers";

const OrderSummaryCard = React.memo(({ order, onSelectOrder, currencyCode, locale }) => {
    if (!order) return null;

    return (
        <div className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden dark:border-border">
            <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1 flex-grow">
                        <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at, locale)}
                        </p>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            Order #{order.id}
                        </h3>
                        <div className='flex items-center flex-wrap gap-2 pt-1'>
                             <Badge
                                variant={getStatusBadgeVariant(order.shipping_status)}
                                size="sm"
                                className="capitalize"
                            >
                                {order.shipping_status || "Unknown"}
                            </Badge>
                             {order.store && (
                                <Badge variant="outline" size="sm">{order.store.storeName}</Badge>
                             )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                        <p className="text-lg font-bold text-primary">
                            {formatCurrency(order.total_amount, currencyCode, locale)}
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
                 {order.order_details && order.order_details.length > 0 && (
                     <div className="mt-3 pt-3 border-t flex space-x-2 overflow-x-auto dark:border-border">
                         {order.order_details.slice(0, 4).map((item, idx) => (
                             <img
                                 key={item.id || idx}
                                 src={item.product?.thumbnail || '/placeholder-image.png'}
                                 alt={item.product?.productName || 'Product'}
                                 className="w-10 h-10 rounded object-cover border flex-shrink-0 bg-muted dark:border-border"
                                 loading="lazy"
                                 onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                             />
                         ))}
                         {order.order_details.length > 4 && (
                             <span className="text-xs self-center text-muted-foreground ml-1">
                                 +{order.order_details.length - 4} more
                             </span>
                         )}
                     </div>
                 )}
            </div>
        </div>
    );
});

export default OrderSummaryCard;