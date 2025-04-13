import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Store, Package, ShoppingCart, AlertCircle, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { formatDate, getStatusBadgeVariant } from '../../utils/helpers';

const DashboardPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [pendingStores, setPendingStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError("Admin authentication required.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` } // Sửa header
            });
            if (response.data.success) {
                setStats(response.data.stats);
                setRecentOrders(response.data.recentOrders || []);
                setPendingStores(response.data.recentPendingStores || []);
            } else {
                setError(response.data.message || "Failed to load dashboard data.");
            }
        } catch (err) {
             if (err.response && err.response.status === 401) {
                 setError("Unauthorized. Please log in again."); // Lỗi 401 rõ ràng hơn
             } else {
                setError(err.response?.data?.message || "An error occurred while fetching data.");
             }
        } finally {
            setLoading(false);
        }
    }, [backendUrl, token]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // Chạy lại khi hàm fetch thay đổi (thường chỉ 1 lần)

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                 <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {[...Array(4)].map((_, i) => (
                         <Card key={i}>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <Skeleton className="h-5 w-24" /> <Skeleton className="h-5 w-5 rounded-full" /> </CardHeader>
                             <CardContent> <Skeleton className="h-8 w-1/2 mb-1" /> <Skeleton className="h-4 w-3/4" /> </CardContent>
                         </Card>
                     ))}
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <Skeleton className="h-64 w-full rounded-lg"/>
                     <Skeleton className="h-64 w-full rounded-lg"/>
                 </div>
            </div>
        )
    }

    if (error) {
        return (
             <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>
                     {error}
                     <Button onClick={fetchDashboardData} variant="secondary" size="sm" className='ml-4'>Retry</Button>
                 </AlertDescription>
             </Alert>
         );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Total Users</CardTitle> <Users className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                        <CardContent> <div className="text-2xl font-bold">{stats.users ?? '-'}</div> </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Total Stores</CardTitle> <Store className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                        <CardContent> <div className="text-2xl font-bold">{stats.stores?.total ?? '-'}</div> <p className="text-xs text-muted-foreground"> {stats.stores?.approved ?? '-'} Approved / {stats.stores?.pending ?? '-'} Pending </p> </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Total Products</CardTitle> <Package className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                        <CardContent> <div className="text-2xl font-bold">{stats.products ?? '-'}</div> </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Total Orders</CardTitle> <ShoppingCart className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                        <CardContent> <div className="text-2xl font-bold">{stats.orders ?? '-'}</div> </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader> <CardTitle>Recent Orders</CardTitle> <CardDescription>The latest 5 orders placed.</CardDescription> </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell> {/* Sửa thành order.id */}
                                            <TableCell>{order.user?.email || 'N/A'}</TableCell> {/* Sửa thành user.email */}
                                            <TableCell> <Badge variant={getStatusBadgeVariant(order.shipping_status)} className="capitalize"> {order.shipping_status || 'N/A'} </Badge> </TableCell> {/* Sửa thành shipping_status */}
                                            <TableCell className="text-xs text-muted-foreground"> {formatDate(order.created_at)} </TableCell> {/* Sửa thành created_at */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : ( <p className="text-sm text-muted-foreground text-center py-4">No recent orders.</p> )}
                         <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                             <Link to="/admin/orders">View All Orders <ArrowRight className="ml-2 h-4 w-4"/></Link>
                         </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader> <CardTitle>Pending Store Approvals</CardTitle> <CardDescription>Stores waiting for your review.</CardDescription> </CardHeader>
                    <CardContent>
                         {pendingStores.length > 0 ? (
                             <Table>
                                 <TableHeader>
                                     <TableRow>
                                         <TableHead>Store Name</TableHead>
                                         <TableHead>Owner</TableHead>
                                         <TableHead>Requested</TableHead>
                                     </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                     {pendingStores.map(store => (
                                         <TableRow key={store.id}> {/* Sửa thành store.id */}
                                             <TableCell className="font-medium">{store.storeName}</TableCell>
                                             <TableCell>{store.owner?.email || 'N/A'}</TableCell> {/* Sửa thành owner.email */}
                                             <TableCell className="text-xs text-muted-foreground"> {formatDate(store.created_at)} </TableCell> {/* Sửa thành created_at */}
                                         </TableRow>
                                     ))}
                                 </TableBody>
                             </Table>
                         ) : ( <p className="text-sm text-muted-foreground text-center py-4">No pending store requests.</p> )}
                         <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                             <Link to="/admin/stores">Manage Stores <ArrowRight className="ml-2 h-4 w-4"/></Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;