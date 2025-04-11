// src/pages/admin/ManageReviewsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MoreHorizontal, AlertCircle, Trash2, Loader2, Star, FilterX } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers'; // Import helpers
import StarRating from '../../components/StarRating';
import PaginationControls from '../admin/PaginationControls'; // Import Pagination
import { Input } from '@/components/ui/input'; // For search
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For rating filter

const ManageReviewsPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters/search
    // const [searchTerm, setSearchTerm] = useState(''); // Maybe search review text later
    const [filterRating, setFilterRating] = useState(''); // '' for All, '1', '2', etc.

    // State for delete confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Reviews Function
    const fetchReviewsAdmin = useCallback(async (page = 1, rating = '') => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError("Admin authentication required."); setLoading(false); return;
        }
        try {
            const params = { page, limit: 10 }; // Adjust limit
            if (rating) {
                params.rating = rating;
            }
            // if (searchTerm) params.search = searchTerm; // Add search later if needed

            const response = await axios.get(`${backendUrl}/api/admin/reviews`, {
                headers: { token },
                params: params
            });

            if (response.data.success) {
                setReviews(response.data.reviews || []);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalReviews: 0 });
            } else {
                setError(response.data.message || "Failed to load reviews."); setReviews([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred fetching reviews."); setReviews([]);
        } finally { setLoading(false); }
    }, [backendUrl, token]);

    // Initial fetch and fetch on filter/page change
    useEffect(() => {
        fetchReviewsAdmin(pagination.currentPage, filterRating);
    }, [fetchReviewsAdmin, pagination.currentPage, filterRating]);

    // --- Delete Logic ---
    const handleDeleteOpen = (review) => {
        setSelectedReview(review);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedReview || !token) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/review/${selectedReview._id}`, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Review deleted successfully!");
                setIsDeleteDialogOpen(false);
                // Check if we need to go back a page after deletion
                const newPage = reviews.length === 1 && pagination.currentPage > 1
                                ? pagination.currentPage - 1
                                : pagination.currentPage;
                 if (newPage !== pagination.currentPage) {
                      setPagination(prev => ({...prev, currentPage: newPage}));
                 } else {
                    fetchReviewsAdmin(newPage, filterRating); // Refresh current or previous page
                 }
            } else {
                toast.error(response.data.message || "Failed to delete review.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting review.");
        } finally {
            setIsDeleting(false);
            setSelectedReview(null); // Clear selected review
        }
    };

     // --- Pagination Handler ---
     const handlePageChange = (newPage) => {
         setPagination(prev => ({ ...prev, currentPage: newPage }));
     };

      // --- Filter Handler ---
      const handleFilterChange = (value) => {
         setFilterRating(value === 'all' ? '' : value);
         setPagination(prev => ({...prev, currentPage: 1})); // Reset page on filter change
      }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Reviews</h1>

            {/* Filters */}
            <div className="flex items-center gap-4">
                {/* <Input
                    placeholder="Search review text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                /> */}
                <Select value={filterRating || 'all'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map(r => (
                            <SelectItem key={r} value={String(r)}>
                                <span className="flex items-center">{r} <Star className="ml-1 h-3 w-3 text-yellow-400 fill-yellow-400"/></span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Button variant="outline" onClick={() => { setFilterRating(''); setPagination(prev => ({...prev, currentPage: 1})); }} disabled={!filterRating}>
                     <FilterX className="mr-2 h-4 w-4" /> Clear Filter
                 </Button>
            </div>

            {/* Error Display */}
             {error && !loading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                     <Button onClick={() => fetchReviewsAdmin(1, filterRating)} size="sm" variant="secondary" className="mt-2">Retry</Button>
                </Alert>
            )}

            {/* Review Table */}
            <Card>
                 <CardHeader>
                    <CardTitle>Review List</CardTitle>
                    <CardDescription>
                        Total Reviews Found: {loading ? <Skeleton className="h-4 w-10 inline-block"/> : pagination.totalReviews}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rating</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={`skel-rev-${i}`}>
                                        <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded"/></TableCell>
                                    </TableRow>
                                ))
                            ) : reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <TableRow key={review._id}>
                                        <TableCell>
                                            <StarRating rating={review.rating} />
                                        </TableCell>
                                         <TableCell className="max-w-xs truncate" title={review.reviewText}> {/* Truncate long reviews */}
                                            {review.reviewText}
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/product/${review.productId?._id}`} className="text-sm hover:underline text-blue-600 dark:text-blue-400">
                                                {review.productId?.name || 'N/A'}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {review.productId?.storeId?.storeName || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{review.userId?.email || 'N/A'}</TableCell>
                                        <TableCell>{formatDate(review.date)}</TableCell>
                                        <TableCell className="text-right">
                                            {/* Actions */}
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {/* Maybe View User/Product/Store links? */}
                                                     <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDeleteOpen(review)} className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 cursor-pointer">
                                                         <Trash2 className="mr-2 h-4 w-4" /> Delete Review
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No reviews found.
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

             {/* Delete Confirmation Dialog */}
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                 <AlertDialogContent>
                     <AlertDialogHeader>
                         <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                         <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the review
                              {selectedReview && ` by ${selectedReview.userId?.email || 'user'} on product ${selectedReview.productId?.name || 'N/A'}`}.
                         </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                         <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                         <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Delete Review
                         </AlertDialogAction>
                     </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
        </div>
    );
};

export default ManageReviewsPage;