import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { ShopContext } from '../../context/ShopContext'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // For actions
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For status filter
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MoreHorizontal, AlertCircle, CheckCircle, Clock, Loader2, ChevronsUpDown, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, getStatusBadgeVariant } from '../../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

     const handlePrev = () => onPageChange(currentPage - 1);
     const handleNext = () => onPageChange(currentPage + 1);

     const pageNumbers = [];
     for(let i = 1; i <= totalPages; i++) {
         pageNumbers.push(i);
     }

    return (
        <div className="flex justify-center items-center mt-6 space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
                Previous
            </Button>
             {pageNumbers.map(num => (
                 <Button
                     key={num}
                     variant={currentPage === num ? 'default' : 'outline'}
                     size="sm"
                     onClick={() => onPageChange(num)}
                 >
                    {num}
                </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
                Next
            </Button>
        </div>
    );
};


const ManageStoresPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [stores, setStores] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalStores: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState(''); // '' for All, 'pending', 'approved'

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
                headers: { token },
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
             setError(err.response?.data?.message || "An error occurred fetching stores.");
             setStores([]);
             setPagination({ currentPage: 1, totalPages: 1, totalStores: 0 });
        } finally {
            setLoading(false);
        }
    }, [backendUrl, token]); // Depend on backendUrl and token

    useEffect(() => {
        fetchStores(pagination.currentPage, filterStatus); // Fetch initial data
    }, [fetchStores, pagination.currentPage, filterStatus]); // Refetch when page or filter changes

    const handleApprove = async (storeId) => {
         if (!token) return toast.error("Authentication required.");
         // Optional: Add a loading state specifically for the approve button
         try {
             const response = await axios.post(`${backendUrl}/api/store/approve`, // Using the existing store route
                 { storeId }, // Send storeId in the body
                 { headers: { token } }
             );
             if (response.data.success) {
                toast.success(`Store ${storeId.slice(-4)} approved successfully!`);
                fetchStores(pagination.currentPage, filterStatus); // Refresh the list
            } else {
                toast.error(response.data.message || "Failed to approve store.");
            }
         } catch(error) {
             console.error("Error approving store:", error);
             toast.error(error.response?.data?.message || "Failed to approve store.");
         }
    };

     const handlePageChange = (newPage) => {
         setPagination(prev => ({ ...prev, currentPage: newPage }));
     };

     const handleFilterChange = (value) => {
        setFilterStatus(value === 'all' ? '' : value);
        setPagination(prev => ({...prev, currentPage: 1})); // Reset to page 1 on filter change
     }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Stores</h1>

            {/* Filters */}
             <div className="flex items-center gap-4">
                 <Select value={filterStatus || 'all'} onValueChange={handleFilterChange}>
                     <SelectTrigger className="w-[180px]">
                         <SelectValue placeholder="Filter by status" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Statuses</SelectItem>
                         <SelectItem value="pending">Pending</SelectItem>
                         <SelectItem value="approved">Approved</SelectItem>
                     </SelectContent>
                 </Select>
                 {/* Add Search input later if needed */}
            </div>

            {/* Error Display */}
             {error && !loading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button onClick={() => fetchStores(1, filterStatus)} size="sm" variant="secondary" className="mt-2">Retry</Button>
                </Alert>
            )}


            {/* Store Table */}
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
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => ( // Skeleton rows
                                    <TableRow key={`skel-${i}`}>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded"/></TableCell>
                                    </TableRow>
                                ))
                            ) : stores.length > 0 ? (
                                stores.map((store) => (
                                    <TableRow key={store._id}>
                                        <TableCell className="font-medium">{store.storeName}</TableCell>
                                        <TableCell>{store.owner?.name || 'N/A'} ({store.owner?.email || 'No Email'})</TableCell>
                                        <TableCell>{store.storeAddress || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(store.status)} className="capitalize">
                                                {store.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(store.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                             {/* Actions Dropdown */}
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     {/* <DropdownMenuItem onClick={() => console.log("View", store._id)}>View Store</DropdownMenuItem> */}
                                                     {/* <DropdownMenuItem onClick={() => console.log("View Products", store._id)}>View Products</DropdownMenuItem> */}
                                                     {store.status === 'pending' && (
                                                         <>
                                                            <DropdownMenuSeparator />
                                                             <DropdownMenuItem
                                                                 onClick={() => handleApprove(store._id)}
                                                                 className="text-green-600 focus:text-green-700 focus:bg-green-100 dark:focus:bg-green-900/50 cursor-pointer"
                                                             >
                                                                 <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                            </DropdownMenuItem>
                                                         </>
                                                     )}
                                                      {/* <DropdownMenuSeparator />
                                                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 cursor-pointer">
                                                          Disable Store
                                                      </DropdownMenuItem> */}
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
        </div>
    );
};

export default ManageStoresPage;