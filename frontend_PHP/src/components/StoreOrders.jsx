import React, { useState, useCallback, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext"; // Adjust path if needed
import { toast } from "react-toastify";
import {
    Table, TableBody, TableCaption, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, PackageCheck, Truck, XCircle, Clock, Package, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/helpers"; // Adjust path if needed

const getStatusBadgeVariant = (status) => {
    const lowerStatus = String(status || "").toLowerCase().trim();
    switch (lowerStatus) {
        case 'delivered': return 'success';
        case 'paid': return 'success';
        case 'canceled': return 'destructive';
        case 'payment failed': return 'destructive';
        case 'out for delivery': return 'default';
        case 'in delivery': return 'default';
        case 'processing': return 'secondary';
        case 'pending payment': return 'warning';
        case 'waiting for pickup': return 'outline';
        default: return 'outline';
    }
};

const getStatusIcon = (status) => {
    const lowerStatus = String(status || "").toLowerCase().trim();
    const iconClass = "h-4 w-4 mr-1.5";
    switch(lowerStatus) {
        case 'delivered': return <CheckCircle className={`${iconClass} text-green-600`} />;
        case 'paid': return <PackageCheck className={`${iconClass} text-green-600`} />;
        case 'canceled': return <XCircle className={`${iconClass} text-red-600`} />;
        case 'payment failed': return <XCircle className={`${iconClass} text-red-600`} />;
        case 'out for delivery': return <Truck className={`${iconClass} text-blue-600`} />;
        case 'in delivery': return <Truck className={`${iconClass} text-blue-600`} />;
        case 'processing': return <Hourglass className={`${iconClass} text-yellow-600`} />;
        case 'pending payment': return <Clock className={`${iconClass} text-yellow-600`} />;
        case 'waiting for pickup': return <Package className={`${iconClass} text-gray-600`} />;
        default: return <Clock className={`${iconClass} text-gray-500`} />;
    }
};

// Receive props from StoreManagement
const StoreOrders = ({ orders, isLoading, error, onRetry }) => {
    const { backendUrl, token } = useContext(ShopContext);
    const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState(null);

    const CURRENCY_CODE = 'VND';
    const LOCALE = 'vi-VN';

    // handleUpdateStatus remains similar but uses props/context for token/url
    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!token || !orderId || !newStatus) return;
        if (!window.confirm(`Are you sure you want to update Order #${orderId} to "${newStatus}"?`)) return;

        setUpdatingStatusOrderId(orderId);
        try {
          const response = await axios.put(`${backendUrl}/api/store/orders/${orderId}/status`,
            { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success(`Order #${orderId} status updated to ${newStatus}`);
                // Instead of setting state, call the retry/refetch function passed from parent
                if (onRetry) onRetry();
            } else {
                toast.error(response.data.message || `Failed to update order ${orderId} status.`);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error(error.response?.data?.message || "Error updating order status.");
        } finally {
            setUpdatingStatusOrderId(null);
        }
    };

    if (isLoading) {
        return (
            <Card>
                 <CardHeader><CardTitle>Store Orders</CardTitle><CardDescription>Loading orders...</CardDescription></CardHeader>
                 <CardContent><div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div></CardContent>
            </Card>
        );
    }

    if (error) {
         return (
             <Card><CardHeader><CardTitle>Store Orders</CardTitle></CardHeader><CardContent>
                 <Alert variant="destructive"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription>
                 {onRetry && <Button onClick={onRetry} variant="secondary" size="sm" className="mt-2">Retry</Button>}
                 </Alert>
             </CardContent></Card>
         );
    }

     if (orders.length === 0) {
         return (
              <Card><CardHeader><CardTitle>Store Orders</CardTitle><CardDescription>Manage recent orders.</CardDescription></CardHeader><CardContent>
                  <p className="text-center text-muted-foreground py-10">No orders found for your store yet.</p>
              </CardContent></Card>
          );
     }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Store Orders</CardTitle>
                <CardDescription>View and manage recent orders for your store.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                      <Table>
                           {/* <TableCaption>A list of recent orders for your store.</TableCaption> */}
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-[80px]">Order ID</TableHead>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Items</TableHead>
                                  <TableHead className="text-right">Amount</TableHead>
                                  <TableHead>Payment</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="min-w-[150px]">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {orders.map((order) => {
                                   const isUpdating = updatingStatusOrderId === order.id;
                                   return (
                                      <TableRow key={order.id}>
                                          <TableCell className="font-medium">#{order.id}</TableCell>
                                          <TableCell>{order.user?.email || order.user_id}</TableCell>
                                          <TableCell>{order.order_details?.length || 0}</TableCell>
                                          <TableCell className="text-right font-medium">
                                               {formatCurrency(order.total_amount, CURRENCY_CODE, LOCALE)}
                                          </TableCell>
                                          <TableCell>
                                               <Badge variant={order.payment_status ? 'success' : 'secondary'} className="capitalize whitespace-nowrap">
                                                   {order.paymentMethod} - {order.payment_status ? 'Paid' : 'Pending'}
                                               </Badge>
                                          </TableCell>
                                           <TableCell>
                                               <Badge variant={getStatusBadgeVariant(order.shipping_status)} className="capitalize flex items-center w-fit whitespace-nowrap">
                                                    {getStatusIcon(order.shipping_status)}
                                                    {order.shipping_status || 'N/A'}
                                               </Badge>
                                           </TableCell>
                                          <TableCell className="whitespace-nowrap">{formatDate(order.created_at, LOCALE)}</TableCell>
                                           <TableCell>
                                                {(order.shipping_status === 'Waiting for Pickup' || order.shipping_status === 'Paid') && (
                                                    <Button size="xs" onClick={() => handleUpdateStatus(order.id, 'Processing')} disabled={isUpdating} className="mr-1">
                                                         {isUpdating ? <Loader2 className="h-3 w-3 animate-spin"/> : "Process"}
                                                     </Button>
                                                )}
                                                 {order.shipping_status === 'Processing' && (
                                                     <Button size="xs" onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')} disabled={isUpdating}>
                                                          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin"/> : "Ship"}
                                                      </Button>
                                                 )}
                                                {(order.shipping_status === 'Waiting for Pickup' || order.shipping_status === 'Pending Payment' || order.shipping_status === 'Paid') && (
                                                     <Button variant="destructive" size="xs" onClick={() => handleUpdateStatus(order.id, 'Canceled')} disabled={isUpdating} className="ml-1">
                                                          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin"/> : "Cancel"}
                                                      </Button>
                                                 )}
                                           </TableCell>
                                      </TableRow>
                                   );
                               })}
                          </TableBody>
                      </Table>
                 </div>
            </CardContent>
        </Card>
    );
};

export default StoreOrders;