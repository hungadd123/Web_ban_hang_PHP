import React, { useState, useEffect, useContext, useCallback } from 'react';

import axios from 'axios';

import { Link } from 'react-router-dom';

import { ShopContext } from '../../context/ShopContext';import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Button } from "@/components/ui/button";import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Thêm Card

import { MoreHorizontal, AlertCircle, Eye, Loader2, FilterX, Calendar as CalendarIcon } from 'lucide-react';

import { toast } from 'react-toastify';

import { formatDate, formatCurrency, getStatusBadgeVariant } from '../../utils/helpers';

import PaginationControls from '../../components/admin/PaginationControls';

import { DateRangePicker } from '@/components/ui/date-range-picker'; // Import DateRangePicker đã tạo

import OrderDetailsPanel from '../../components/admin/OrderDetailsPanel'; // Import Panel chi tiết

import Footer from '../../components/Footer'; // Import Footer



const ManageOrdersPage = () => {

    const { backendUrl, token, currency } = useContext(ShopContext);

    const CURRENCY_CODE = currency === '$' ? 'USD' : 'VND'; 
    const LOCALE = currency === '$' ? 'en-US' : 'vi-VN'; 



    const [orders, setOrders] = useState([]);

    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0 });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);



    // State for filters

    const [filterStatus, setFilterStatus] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    const [dateRange, setDateRange] = useState(undefined); // State cho DateRangePicker



    // State for viewing details

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [isPanelOpen, setIsPanelOpen] = useState(false);



    // Fetch Orders Function

    const fetchOrdersAdmin = useCallback(async (page = 1, status = '', search = '', date = undefined) => {

        setLoading(true);

        setError(null);

        if (!token) {

            setError("Admin authentication required.");

            setLoading(false);

            return;

        }

        try {

            const params = { page, limit: 10 }; // Adjust limit

            if (status) params.status = status;

            if (search) params.search = search;

            if (date?.from) params.from = date.from.toISOString(); // Gửi định dạng ISO

            if (date?.to) {

                // Set end of day for the 'to' date for inclusive range query

                const endDate = new Date(date.to);

                endDate.setHours(23, 59, 59, 999);

                params.to = endDate.toISOString();

            }





            const response = await axios.get(`${backendUrl}/api/admin/orders`, { // Gọi API admin

                headers: { token },

                params: params

            });



            if (response.data.success) {

                // Làm sạch màu sắc và ảnh (nếu cần, tương tự các hàm fetch khác)

                 const cleanedOrders = (response.data.orders || []).map(order => ({

                    ...order,

                    items: (order.items || []).map(item => ({

                        ...item,

                        color: typeof item.color === 'string' ? item.color.replace(/['"]+/g, '') : item.color,

                        image: Array.isArray(item.image) ? item.image : (typeof item.image === 'string' ? item.image.split(',').map(url => url.trim()) : [])

                    }))

                }));

                setOrders(cleanedOrders);

                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalOrders: 0 });

            } else {

                setError(response.data.message || "Failed to load orders.");

                setOrders([]);

            }

        } catch (err) {

            setError(err.response?.data?.message || "An error occurred fetching orders.");

            setOrders([]);

        } finally {

            setLoading(false);

        }

    }, [backendUrl, token]);



    // Initial fetch and fetch on filter/page change

    useEffect(() => {

        // Trigger fetch when page, status, search term (via button), or date range changes

        fetchOrdersAdmin(pagination.currentPage, filterStatus, searchTerm, dateRange);

    }, [fetchOrdersAdmin, pagination.currentPage, filterStatus, searchTerm, dateRange]); // Thêm searchTerm và dateRange vào dependencies





    // --- Handlers ---

    const handlePageChange = (newPage) => {

        setPagination(prev => ({ ...prev, currentPage: newPage }));

    };



    const handleStatusFilterChange = (value) => {

        setFilterStatus(value === 'all' ? '' : value);

        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset page

    }



    const handleDateChange = (selectedDateRange) => {

        setDateRange(selectedDateRange); // Update state được truyền từ DateRangePicker

        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset page

    }



    const handleSearchChange = (event) => {

        setSearchTerm(event.target.value);

    };

    const handleSearchSubmit = () => { // Trigger search explicitly

        setPagination(prev => ({ ...prev, currentPage: 1 }));

        // fetchOrdersAdmin đã được gọi bởi useEffect khi searchTerm thay đổi (nếu bạn muốn search tức thì)

        // Hoặc để ở đây nếu chỉ muốn search khi bấm nút

         fetchOrdersAdmin(1, filterStatus, searchTerm, dateRange);

    }



    const clearFilters = () => {

        setSearchTerm('');

        setFilterStatus('');

        setDateRange(undefined); // Reset date range

        setPagination(prev => ({ ...prev, currentPage: 1 }));

    }





    const handleViewDetails = useCallback((order) => {

        setSelectedOrder(order);

        setIsPanelOpen(true);

    }, []);



    const handleClosePanel = useCallback(() => {

        setIsPanelOpen(false);

        setSelectedOrder(null);

    }, []);



    // --- Render ---

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>



            {/* Filters */}

            <div className="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-4 bg-card p-4 rounded-lg border shadow-sm">

                <div className="flex-1 min-w-[150px]">

                    <Label htmlFor="search-order" className="text-xs">Search</Label>

                    <Input

                        id="search-order"

                        placeholder="Order ID, Email, Store..."

                        value={searchTerm}

                        onChange={handleSearchChange}

                        className="h-9"

                         onKeyPress={e => e.key === 'Enter' && handleSearchSubmit()}

                    />

                </div>

                 <div className="min-w-[180px]">

                    <Label htmlFor="status-filter" className="text-xs">Status</Label>

                    <Select value={filterStatus || 'all'} onValueChange={handleStatusFilterChange}>

                        <SelectTrigger id="status-filter" className="h-9">

                            <SelectValue placeholder="Filter by status" />

                        </SelectTrigger>

                        <SelectContent>

                            <SelectItem value="all">All Statuses</SelectItem>

                            <SelectItem value="Order Placed">Order Placed</SelectItem>

                            <SelectItem value="Paid">Paid</SelectItem>

                            <SelectItem value="Processing">Processing</SelectItem>

                            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>

                            <SelectItem value="Delivered">Delivered</SelectItem>

                            <SelectItem value="Cancelled">Cancelled</SelectItem>

                            <SelectItem value="Failed">Payment Failed</SelectItem>

                        </SelectContent>

                    </Select>

                 </div>

                 <div>

                     <Label className="text-xs block mb-1.5">Date Range</Label> {/* Label cho DatePicker */}

                    <DateRangePicker date={dateRange} onDateChange={handleDateChange} className="h-9" />

                 </div>

                  <Button onClick={handleSearchSubmit} size="sm" className="h-9">Search</Button>

                 <Button variant="ghost" onClick={clearFilters} size="sm" className="h-9" disabled={!searchTerm && !filterStatus && !dateRange}>

                     <FilterX className="mr-2 h-4 w-4" /> Clear

                 </Button>

            </div>



            {/* Error Display */}

             {error && !loading && (

                <Alert variant="destructive">

                    <AlertCircle className="h-4 w-4" />

                    <AlertTitle>Error</AlertTitle>

                    <AlertDescription>{error}</AlertDescription>

                     <Button onClick={() => fetchOrdersAdmin(1, filterStatus, searchTerm, dateRange)} size="sm" variant="secondary" className="mt-2">Retry</Button>

                </Alert>

            )}



            {/* Order Table */}

            <Card>

                <CardHeader>

                    <CardTitle>Order List</CardTitle>

                     <CardDescription>

                         Total Orders Found: {loading ? <Skeleton className="h-4 w-10 inline-block"/> : pagination.totalOrders}

                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <Table>

                        <TableHeader>

                            <TableRow>

                                <TableHead>Order ID</TableHead>

                                <TableHead>Date</TableHead>

                                <TableHead>Customer</TableHead>

                                <TableHead>Store</TableHead>

                                <TableHead className="text-right">Amount</TableHead>

                                <TableHead>Payment</TableHead>

                                <TableHead>Status</TableHead>

                                <TableHead className="text-right">Actions</TableHead>

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {loading ? (

                                [...Array(10)].map((_, i) => (

                                    <TableRow key={`skel-ord-${i}`}>

                                        <TableCell><Skeleton className="h-5 w-16"/></TableCell>

                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>

                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>

                                        <TableCell><Skeleton className="h-5 w-28"/></TableCell>

                                        <TableCell><Skeleton className="h-5 w-20 ml-auto"/></TableCell>

                                        <TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell>

                                        <TableCell><Skeleton className="h-6 w-24 rounded-full"/></TableCell>

                                        <TableCell className="text-right"><Skeleton className="h-8 w-16 rounded"/></TableCell>

                                    </TableRow>

                                ))

                            ) : orders.length > 0 ? (

                                orders.map((order) => (

                                    <TableRow key={order._id}>

                                        <TableCell className="font-medium">#{order._id.slice(-6).toUpperCase()}</TableCell>

                                        <TableCell className="text-xs">{formatDate(order.date, LOCALE)}</TableCell>

                                        <TableCell className="text-sm">{order.userId?.name || order.address?.firstName || 'N/A'}</TableCell>

                                        <TableCell className="text-sm">{order.storeId?.storeName || 'N/A'}</TableCell>

                                        <TableCell className="text-right font-medium">{formatCurrency(order.amount, CURRENCY_CODE, LOCALE)}</TableCell>

                                        <TableCell>

                                             <Badge variant={order.payment ? 'success' : 'warning'} size="sm" className="capitalize text-xs">

                                                {order.paymentMethod} - {order.payment ? 'Paid' : 'Pending'}

                                             </Badge>

                                         </TableCell>

                                        <TableCell>

                                            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">

                                                {order.status}

                                            </Badge>

                                        </TableCell>

                                        <TableCell className="text-right">

                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>

                                                <Eye className="h-4 w-4 mr-1"/> Details

                                            </Button>

                                            {/* Thêm actions khác nếu cần (vd: Refund) */}

                                        </TableCell>

                                    </TableRow>

                                ))

                            ) : (

                                <TableRow>

                                    <TableCell colSpan={8} className="h-24 text-center"> {/* Adjusted colSpan */}

                                        No orders found matching your criteria.

                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                 </CardContent>

                 {/* Pagination Controls */}

                 {!loading && pagination.totalPages > 1 && (

                     <CardFooter>

                        <PaginationControls

                            currentPage={pagination.currentPage}

                            totalPages={pagination.totalPages}

                            onPageChange={handlePageChange}

                        />

                    </CardFooter>

                )}

            </Card>



             {/* Order Details Panel */}

             <OrderDetailsPanel

                 order={selectedOrder}

                 isOpen={isPanelOpen}

                 onClose={handleClosePanel}

                 currencyCode={CURRENCY_CODE}

                 locale={LOCALE}

             />

        </div>

    );

};



export default ManageOrdersPage;