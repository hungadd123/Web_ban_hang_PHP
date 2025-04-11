// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext'; // Điều chỉnh đường dẫn
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Store, Package, ShoppingCart, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { formatDate, getStatusBadgeVariant } from '../../utils/helpers'; // Import helpers

const DashboardPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [pendingStores, setPendingStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            if (!token) {
                 setError("Admin authentication required.");
                 setLoading(false);
                 return;
             }

            try {
                const response = await axios.get(`${backendUrl}/api/admin/stats`, {
                    headers: { token }
                });
                if (response.data.success) {
                    setStats(response.data.stats);
                    setRecentOrders(response.data.recentOrders || []);
                    setPendingStores(response.data.recentPendingStores || []);
                } else {
                    setError(response.data.message || "Failed to load dashboard data.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [backendUrl, token]);

    // --- Render Loading State ---
    if (loading) {
        return (
            <div className="space-y-6">
                 <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-1/2 mb-1" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
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

    // --- Render Error State ---
     if (error) {
        return (
             <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
             </Alert>
         );
    }

    // --- Render Dashboard Content ---
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {/* Stat Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users ?? '-'}</div>
                            {/* <p className="text-xs text-muted-foreground">+X% from last month</p> */}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stores?.total ?? '-'}</div>
                             <p className="text-xs text-muted-foreground">
                                {stats.stores?.approved ?? '-'} Approved / {stats.stores?.pending ?? '-'} Pending
                             </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.products ?? '-'}</div>
                            {/* <p className="text-xs text-muted-foreground">+X since last hour</p> */}
                        </CardContent>
                    </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.orders ?? '-'}</div>
                             {/* <p className="text-xs text-muted-foreground">+X% from last month</p> */}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Orders and Pending Stores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>The latest 5 orders placed.</CardDescription>
                    </CardHeader>
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
                                        <TableRow key={order._id}>
                                            <TableCell className="font-medium">#{order._id.slice(-6).toUpperCase()}</TableCell>
                                            <TableCell>{order.userId?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                 <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                                                     {order.status}
                                                 </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(order.date)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No recent orders.</p>
                        )}
                         <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                            <Link to="/admin/orders">View All Orders <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Pending Stores Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Store Approvals</CardTitle>
                         <CardDescription>Stores waiting for your review.</CardDescription>
                    </CardHeader>
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
                                        <TableRow key={store._id}>
                                            <TableCell className="font-medium">{store.storeName}</TableCell>
                                            <TableCell>{store.owner?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(store.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No pending store requests.</p>
                         )}
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