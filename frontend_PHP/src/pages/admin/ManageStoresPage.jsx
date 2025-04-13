import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MoreHorizontal, AlertCircle, CheckCircle, Clock, Loader2, XCircle, FilterX } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, getStatusBadgeVariant } from '../../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import PaginationControls from './PaginationControls';


const ManageStoresPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [stores, setStores] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalStores: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchStores = useCallback(async (page = 1, status = '') => {
        setLoading(true);
        setError(null);
        if (!token) {
             setError("Admin authentication required.");
             setLoading(false);
             return;
         }

        try {
            const params = { page, limit: 10 };
            if (status) {
                params.status = status;
            }

            const response = await axios.get(`${backendUrl}/api/admin/stores`, {
                headers: { Authorization: `Bearer ${token}` }, // Gửi token ở đây
                params: params
            });

            if (response.data.success) {
                setStores(response.data.stores || []);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalStores: 0 });
            } else {
                setError(response.data.message || "Failed to load stores.");
                setStores([]);
                setPagination({ currentPage: 1, totalPages: 1, totalStores: 0 });
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "An error occurred fetching stores.";
             setError(errMsg);
            if(err.response?.status === 401){
                setError("Unauthenticated. Please log in again."); // Cụ thể hóa lỗi 401
            }
             setStores([]);
             setPagination({ currentPage: 1, totalPages: 1, totalStores: 0 });
        } finally {
            setLoading(false);
        }
    }, [backendUrl, token]);

    useEffect(() => {
        fetchStores(pagination.currentPage, filterStatus);
    }, [fetchStores, pagination.currentPage, filterStatus]);

    const handleApproveReject = async (storeId, action) => {
        if (!token || actionLoading === storeId) return;
        setActionLoading(storeId);
        const endpoint = `${backendUrl}/api/admin/stores/${storeId}/${action}`;
        const successMessage = `Store ${action === 'approve' ? 'approved' : 'rejected'} successfully!`;
        const errorMessageBase = `Failed to ${action} store.`;

        try {
            const response = await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                toast.success(successMessage);
                fetchStores(pagination.currentPage, filterStatus);
            } else {
                toast.error(response.data.message || errorMessageBase);
            }
        } catch (error) {
            console.error(`Error ${action} store:`, error);
            toast.error(error.response?.data?.message || errorMessageBase);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleFilterChange = (value) => {
        setFilterStatus(value === 'all' ? '' : value);
        setPagination(prev => ({...prev, currentPage: 1}));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Stores</h1>

            <div className="flex items-center gap-4">
                <Select value={filterStatus || 'all'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="ghost" onClick={() => handleFilterChange('all')} size="sm" disabled={!filterStatus}>
                     <FilterX className="mr-2 h-4 w-4" /> Clear Filter
                 </Button>
            </div>

            {error && !loading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button onClick={() => fetchStores(1, filterStatus)} size="sm" variant="secondary" className="mt-2">Retry</Button>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Store List</CardTitle>
                    <CardDescription>
                        Total Stores: {loading ? <Skeleton className="h-4 w-10 inline-block"/> : pagination.totalStores}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <TableRow key={`skel-${i}`}>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded"/></TableCell>
                                    </TableRow>
                                ))
                            ) : stores.length > 0 ? (
                                stores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell className="font-medium">{store.storeName}</TableCell>
                                        <TableCell>{store.owner?.name || 'N/A'} ({store.owner?.email || 'No Email'})</TableCell>
                                        <TableCell className="max-w-xs truncate" title={store.description}>{store.description || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(store.status)} className="capitalize">
                                                {store.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(store.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {store.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleApproveReject(store.id, 'approve')}
                                                                disabled={actionLoading === store.id}
                                                                className="text-green-600 focus:text-green-700 focus:bg-green-100 dark:focus:bg-green-900/50 cursor-pointer"
                                                            >
                                                                {actionLoading === store.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />} Approve
                                                            </DropdownMenuItem>
                                                             <DropdownMenuItem
                                                                 onClick={() => handleApproveReject(store.id, 'reject')}
                                                                 disabled={actionLoading === store.id}
                                                                 className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 cursor-pointer"
                                                             >
                                                                {actionLoading === store.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />} Reject
                                                            </DropdownMenuItem>
                                                         </>
                                                     )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No stores found matching the criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </CardContent>
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
        </div>
    );
};

export default ManageStoresPage;