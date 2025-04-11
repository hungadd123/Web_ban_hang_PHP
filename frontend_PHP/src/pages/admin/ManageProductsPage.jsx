// src/pages/admin/ManageProductsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MoreHorizontal, AlertCircle, Edit, Trash2, Loader2, PackageSearch, FilterX, Search as SearchIcon, Eye as ViewIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, formatCurrency } from '../../utils/helpers';
import PaginationControls from '../admin/PaginationControls'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";


const ManageProductsPage = () => {
    const { backendUrl, token, currency } = useContext(ShopContext);
    const CURRENCY_CODE = currency === '$' ? 'USD' : 'VND';
    const LOCALE = currency === '$' ? 'en-US' : 'vi-VN';

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStore, setFilterStore] = useState('');
    const [categories, setCategories] = useState([]);
    const [storesList, setStoresList] = useState([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '', description: '', price: '', category: '', popular: false, colors: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFilterData = useCallback(async () => {
        if (!token) return;
        try {
            const [catRes, storeRes] = await Promise.all([
                axios.get(`${backendUrl}/api/categories`, { headers: { token } }),
                axios.get(`${backendUrl}/api/admin/stores/list`, { headers: { token } })
            ]);
            // Filter out empty or null category names before setting state
            if (catRes.data.success) setCategories(catRes.data.categories?.filter(cat => cat) || []);
            if (storeRes.data.success) setStoresList(storeRes.data.stores || []);
        } catch (err) {
            console.error("Error fetching filter data:", err);
        }
    }, [backendUrl, token]);

    const fetchProductsAdmin = useCallback(async (page = 1, category = '', store = '', search = '') => {
        setLoading(true);
        setError(null);
        if (!token) {
             setError("Admin authentication required."); setLoading(false); return;
        }
        try {
            const params = { page, limit: 10 };
            if (category) params.category = category;
            if (store) params.storeId = store;
            if (search) params.search = search;

            const response = await axios.get(`${backendUrl}/api/admin/products`, { headers: { token }, params });

            if (response.data.success) {
                 const cleanedProducts = (response.data.products || []).map(p => ({
                    ...p,
                    colors: Array.isArray(p.colors) ? p.colors.map(c => String(c).replace(/['"]+/g, '')) : [],
                    image: Array.isArray(p.image) ? p.image : (typeof p.image === 'string' ? p.image.split(',').map(url => url.trim()) : [])
                }));
                setProducts(cleanedProducts);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalProducts: 0 });
            } else {
                setError(response.data.message || "Failed to load products."); setProducts([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred fetching products."); setProducts([]);
        } finally { setLoading(false); }
    }, [backendUrl, token]);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData]);

    useEffect(() => {
        fetchProductsAdmin(pagination.currentPage, filterCategory, filterStore, searchTerm);
    }, [fetchProductsAdmin, pagination.currentPage, filterCategory, filterStore, searchTerm]);

    const handleEditOpen = (product) => {
        setSelectedProduct(product);
        setEditFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category || '',
            popular: product.popular || false,
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : ''
        });
        setIsEditDialogOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

     const handleEditSelectChange = (value) => {
         setEditFormData(prev => ({ ...prev, category: value }));
     };
     const handleEditCheckedChange = (checked) => {
          setEditFormData(prev => ({ ...prev, popular: !!checked })); // Ensure boolean
     }

    const handleSaveEdit = async () => {
        if (!selectedProduct || !token) return;
        setIsSaving(true);
        try {
            const colorsArray = editFormData.colors.split(',').map(c => c.trim().replace(/['"]+/g, '')).filter(Boolean);
            const priceNumber = parseFloat(editFormData.price);

            const updatePayload = {
                name: editFormData.name,
                description: editFormData.description,
                price: isNaN(priceNumber) ? selectedProduct.price : priceNumber,
                category: editFormData.category,
                popular: editFormData.popular,
                colors: colorsArray
            };

            const response = await axios.put(`${backendUrl}/api/admin/product/${selectedProduct._id}`,
                updatePayload,
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("Product updated successfully!");
                setIsEditDialogOpen(false);
                fetchProductsAdmin(pagination.currentPage, filterCategory, filterStore, searchTerm);
            } else {
                toast.error(response.data.message || "Failed to update product.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating product.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOpen = (product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProduct || !token) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/product/${selectedProduct._id}`, {
                headers: { token }
            });
            if (response.data.success) {
                toast.success("Product deleted successfully!");
                setIsDeleteDialogOpen(false);
                const newPage = products.length === 1 && pagination.currentPage > 1
                                ? pagination.currentPage - 1
                                : pagination.currentPage;
                 if (newPage !== pagination.currentPage) {
                      setPagination(prev => ({...prev, currentPage: newPage}));
                 } else {
                    fetchProductsAdmin(newPage, filterCategory, filterStore, searchTerm);
                 }
            } else {
                toast.error(response.data.message || "Failed to delete product.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error deleting product.");
        } finally {
            setIsDeleting(false);
            setSelectedProduct(null);
        }
    };

     const handlePageChange = (newPage) => {
         setPagination(prev => ({ ...prev, currentPage: newPage }));
     };

      const handleCategoryFilterChange = (value) => {
         setFilterCategory(value === 'all' ? '' : value);
         setPagination(prev => ({...prev, currentPage: 1}));
      }
       const handleStoreFilterChange = (value) => {
         setFilterStore(value === 'all' ? '' : value);
         setPagination(prev => ({...prev, currentPage: 1}));
      }
       const handleSearchTermChange = (event) => {
         setSearchTerm(event.target.value);
       };
       const handleSearchSubmit = () => {
         setPagination(prev => ({...prev, currentPage: 1}));
         // useEffect will trigger fetch because searchTerm changes state
         // If using explicit button, call fetch here:
         // fetchProductsAdmin(1, filterCategory, filterStore, searchTerm);
     }
     const clearFilters = () => {
         setSearchTerm('');
         setFilterCategory('');
         setFilterStore('');
         setPagination(prev => ({ ...prev, currentPage: 1 }));
     };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage All Products</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
                    <div className="flex-grow min-w-[200px] sm:max-w-xs">
                        <Label htmlFor="search-product">Search Name</Label>
                        <Input
                            id="search-product"
                            placeholder="Product name..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            onKeyPress={e => e.key === 'Enter' && handleSearchSubmit()}
                        />
                    </div>
                    <div className="min-w-[180px]">
                        <Label htmlFor="category-filter">Category</Label>
                        <Select value={filterCategory || 'all'} onValueChange={handleCategoryFilterChange}>
                            <SelectTrigger id="category-filter">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => (
                                    cat && <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="min-w-[200px]">
                         <Label htmlFor="store-filter">Store</Label>
                         <Select value={filterStore || 'all'} onValueChange={handleStoreFilterChange}>
                            <SelectTrigger id="store-filter">
                                <SelectValue placeholder="Select store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stores</SelectItem>
                                {storesList.map(store => (
                                   store && <SelectItem key={store._id} value={store._id}>{store.storeName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSearchSubmit} size="sm"><SearchIcon className="mr-2 h-4 w-4"/>Search</Button>
                    <Button variant="ghost" onClick={clearFilters} size="sm" disabled={!searchTerm && !filterCategory && !filterStore}>
                        <FilterX className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </CardContent>
            </Card>

            {error && !loading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button onClick={() => fetchProductsAdmin(1, filterCategory, filterStore, searchTerm)} size="sm" variant="secondary" className="mt-2">Retry</Button>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>
                        Showing page {pagination.currentPage} of {pagination.totalPages}. Total: {loading ? '...' : pagination.totalProducts} products.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <TableRow key={`skel-prod-${i}`}>
                                        <TableCell><Skeleton className="h-10 w-10 rounded"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded"/></TableCell>
                                    </TableRow>
                                ))
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product._id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <Avatar className="h-10 w-10 rounded border">
                                                 <AvatarImage src={product.image?.[0] || '/placeholder-image.png'} alt={product.name}/>
                                                 <AvatarFallback>
                                                    <PackageSearch className='h-4 w-4 text-muted-foreground'/>
                                                 </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{product.storeId?.storeName || 'N/A'}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>{formatCurrency(product.price, CURRENCY_CODE, LOCALE)}</TableCell>
                                        <TableCell>{formatDate(product.date)}</TableCell>
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
                                                    {/* Optional: View on site link */}
                                                     <DropdownMenuItem asChild className="cursor-pointer">
                                                         <Link to={`/product/${product._id}`} target="_blank"><ViewIcon className="mr-2 h-4 w-4" /> View on Site</Link>
                                                     </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditOpen(product)} className="cursor-pointer">
                                                         <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                     <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDeleteOpen(product)} className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 cursor-pointer">
                                                         <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No products found matching your criteria.
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

             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                 <DialogContent className="sm:max-w-[525px]">
                     <DialogHeader>
                         <DialogTitle>Edit Product</DialogTitle>
                         <DialogDescription>
                             Make changes for product: <span className="font-semibold">{selectedProduct?.name}</span>
                         </DialogDescription>
                     </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-5">
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="edit-name" className="text-right">Name</Label>
                             <Input id="edit-name" name="name" value={editFormData.name} onChange={handleEditInputChange} className="col-span-3" />
                         </div>
                          <div className="grid grid-cols-4 items-start gap-4">
                             <Label htmlFor="edit-description" className="text-right pt-2">Description</Label>
                             <Textarea id="edit-description" name="description" value={editFormData.description} onChange={handleEditInputChange} className="col-span-3 min-h-[80px]" />
                         </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="edit-price" className="text-right">Price ({CURRENCY_CODE})</Label>
                             <Input id="edit-price" name="price" type="number" step="0.01" value={editFormData.price} onChange={handleEditInputChange} className="col-span-3" />
                         </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="edit-category" className="text-right">Category</Label>
                              <Select value={editFormData.category} onValueChange={handleEditSelectChange}>
                                 <SelectTrigger id="edit-category" className="col-span-3">
                                     <SelectValue placeholder="Select category" />
                                 </SelectTrigger>
                                 <SelectContent>
                                      {/* Filter out empty strings before mapping */}
                                      {categories.filter(cat => cat).map(cat => (
                                         <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                         </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="edit-colors" className="text-right">Colors</Label>
                             <Input id="edit-colors" name="colors" value={editFormData.colors} onChange={handleEditInputChange} className="col-span-3" placeholder="Comma-separated, e.g., Red, Blue" />
                         </div>
                          <div className="flex items-center space-x-2 col-start-2 col-span-3">
                             <Checkbox id="edit-popular" name="popular" checked={editFormData.popular} onCheckedChange={handleEditCheckedChange}/>
                             <Label htmlFor="edit-popular" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Mark as Popular
                            </Label>
                         </div>
                     </div>
                     <DialogFooter>
                          <DialogClose asChild>
                             <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
                         </DialogClose>
                         <Button type="button" onClick={handleSaveEdit} disabled={isSaving}>
                              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Save changes
                         </Button>
                     </DialogFooter>
                 </DialogContent>
             </Dialog>

             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                 <AlertDialogContent>
                     <AlertDialogHeader>
                         <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                         <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product
                              <span className="font-semibold"> {selectedProduct?.name}</span>.
                         </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                         <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                         <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Delete
                         </AlertDialogAction>
                     </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>

        </div>
    );
};

export default ManageProductsPage;