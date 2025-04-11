// src/pages/admin/ManageUsersPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext'; // Điều chỉnh đường dẫn
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // For potential actions
import { Input } from "@/components/ui/input"; // For search
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For role filter
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MoreHorizontal, AlertCircle, User, Edit, Trash2, Lock, Unlock, Loader2, FilterX, UserCog } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers'; // Import helpers
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PaginationControls from '../admin/PaginationControls'; // Import Pagination

const ManageUsersPage = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters/search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState(''); // '' for All, 'admin', 'user', etc.

    // State for action confirmations (optional)
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(''); // e.g., 'changeRole', 'toggleBlock'
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    // Fetch Users Function
    const fetchUsersAdmin = useCallback(async (page = 1, role = '', search = '') => {
        setLoading(true);
        setError(null);
        if (!token) {
             setError("Admin authentication required."); setLoading(false); return;
        }
        try {
            const params = { page, limit: 10 }; // Adjust limit
            if (role) params.role = role; // Backend needs to support filtering by roleName or roleId
            if (search) params.search = search;

            const response = await axios.get(`${backendUrl}/api/admin/users`, {
                headers: { token },
                params: params
            });

            if (response.data.success) {
                setUsers(response.data.users || []);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalUsers: 0 });
            } else {
                setError(response.data.message || "Failed to load users."); setUsers([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred fetching users."); setUsers([]);
        } finally { setLoading(false); }
    }, [backendUrl, token]);

    // Initial fetch and fetch on filter/page change
    useEffect(() => {
        fetchUsersAdmin(pagination.currentPage, filterRole, searchTerm);
    }, [fetchUsersAdmin, pagination.currentPage, filterRole, searchTerm]);

    // --- Action Handlers (Placeholders - Require Backend Implementation) ---
    const handleAction = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setIsActionModalOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedUser || !actionType || !token) return;
        setIsProcessingAction(true);
        try {
            let endpoint = '';
            let payload = {};
            let successMessage = '';

            if (actionType === 'toggleBlock') {
                 // TODO: Determine the new status (e.g., !selectedUser.isBlocked)
                 // endpoint = `${backendUrl}/api/admin/user/${selectedUser._id}/status`;
                 // payload = { isBlocked: !selectedUser.isBlocked };
                 // successMessage = `User ${selectedUser.isBlocked ? 'unblocked' : 'blocked'} successfully!`;
                 toast.info("Block/Unblock action - Backend not implemented yet."); // Placeholder
            } else if (actionType === 'changeRole') {
                 // TODO: Get the new role from a select dropdown inside the modal
                 // const newRole = /* Get role from modal state */;
                 // endpoint = `${backendUrl}/api/admin/user/${selectedUser._id}/role`;
                 // payload = { roleId: newRole }; // Or roleName, depending on backend
                 // successMessage = `User role changed successfully!`;
                 toast.info("Change role action - Backend not implemented yet."); // Placeholder
            } else {
                 toast.warning("Unknown action type.");
                 setIsProcessingAction(false);
                 setIsActionModalOpen(false);
                 return;
            }

            // --- Make the actual API call when backend is ready ---
            // const response = await axios.put(endpoint, payload, { headers: { token } });
            // if (response.data.success) {
            //     toast.success(successMessage);
            //     fetchUsersAdmin(pagination.currentPage, filterRole, searchTerm); // Refresh list
            // } else {
            //     toast.error(response.data.message || `Failed to ${actionType}.`);
            // }
            // --- End API call placeholder ---

             setIsActionModalOpen(false); // Close modal after placeholder action

        } catch (error) {
            toast.error(error.response?.data?.message || `Error performing action: ${actionType}.`);
        } finally {
            setIsProcessingAction(false);
             // Reset selected user? Maybe keep it if the modal didn't close on error
            // setSelectedUser(null);
            // setActionType('');
        }
    };

     // --- Pagination Handler ---
     const handlePageChange = (newPage) => {
         setPagination(prev => ({ ...prev, currentPage: newPage }));
     };

      // --- Filter Handlers ---
      const handleRoleFilterChange = (value) => {
         setFilterRole(value === 'all' ? '' : value);
         setPagination(prev => ({...prev, currentPage: 1}));
      }
       const handleSearchChange = (event) => {
         setSearchTerm(event.target.value);
         // Optional: Add debounce here if you want search-as-you-type
         // For now, search might trigger on blur or explicit button click (not implemented here)
         // Or simply refetch on every key stroke (can be inefficient)
         // To refetch on every keystroke (add searchTerm to fetchUsersAdmin dependency and useEffect)
         // setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset page on search
     };
     // Example: Button to trigger search if not doing search-as-you-type
     const handleSearchSubmit = () => {
         setPagination(prev => ({...prev, currentPage: 1}));
         fetchUsersAdmin(1, filterRole, searchTerm);
     }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>

             {/* Filters */}
             <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Input
                     placeholder="Search by name or email..."
                     value={searchTerm}
                     onChange={handleSearchChange}
                     className="max-w-sm"
                     // Add onKeyPress={e => e.key === 'Enter' && handleSearchSubmit()} for Enter key search
                 />
                  {/* Optional: Search Button */}
                 {/* <Button onClick={handleSearchSubmit} size="sm">Search</Button> */}

                 <Select value={filterRole || 'all'} onValueChange={handleRoleFilterChange}>
                     <SelectTrigger className="w-[180px]">
                         <SelectValue placeholder="Filter by role" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Roles</SelectItem>
                         {/* TODO: Populate roles dynamically from backend if needed */}
                         <SelectItem value="admin">Admin</SelectItem>
                         <SelectItem value="user">User</SelectItem>
                     </SelectContent>
                 </Select>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterRole(''); setPagination(prev => ({...prev, currentPage: 1})); }} disabled={!searchTerm && !filterRole}>
                     <FilterX className="mr-2 h-4 w-4" /> Clear Filters
                 </Button>
            </div>

             {/* Error Display */}
             {error && !loading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                     <Button onClick={() => fetchUsersAdmin(1, filterRole, searchTerm)} size="sm" variant="secondary" className="mt-2">Retry</Button>
                </Alert>
            )}

            {/* User Table */}
            <Card>
                 <CardHeader>
                    <CardTitle>User List</CardTitle>
                     <CardDescription>
                         Total Users Found: {loading ? <Skeleton className="h-4 w-10 inline-block"/> : pagination.totalUsers}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={`skel-user-${i}`}>
                                        <TableCell><Skeleton className="h-10 w-10 rounded-full"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 rounded-full"/></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded"/></TableCell>
                                    </TableRow>
                                ))
                            ) : users.length > 0 ? (
                                users.map((usr) => (
                                    <TableRow key={usr._id}>
                                        <TableCell>
                                            <Avatar className="h-9 w-9 border"> {/* Smaller avatar */}
                                                 <AvatarImage src={usr.image || '/default-avatar.png'} alt={usr.name}/>
                                                 <AvatarFallback className="text-xs">
                                                      {usr.name ? usr.name.charAt(0).toUpperCase() : <User />}
                                                 </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{usr.name}</TableCell>
                                        <TableCell>{usr.email}</TableCell>
                                        <TableCell>
                                            {/* Assuming roleId is populated with roleName */}
                                            <Badge variant={usr.roleId?.roleName === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {usr.roleId?.roleName || 'Unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(usr.createdAt)}
                                        </TableCell>
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
                                                     <DropdownMenuItem onClick={() => navigate(`/user-profile/${usr._id}`)} className="cursor-pointer"> {/* Example Link */}
                                                         <User className="mr-2 h-4 w-4" /> View Profile
                                                     </DropdownMenuItem>
                                                     <DropdownMenuSeparator />
                                                     <DropdownMenuItem onClick={() => handleAction(usr, 'changeRole')} className="cursor-pointer">
                                                         <UserCog className="mr-2 h-4 w-4" /> Change Role
                                                     </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleAction(usr, 'toggleBlock')} className="cursor-pointer">
                                                        {/* TODO: Check user.isBlocked or similar field */}
                                                        {usr.isBlocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                                                        {usr.isBlocked ? 'Unblock' : 'Block'} User
                                                     </DropdownMenuItem>
                                                     <DropdownMenuSeparator />
                                                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:focus:bg-red-900/50 cursor-pointer">
                                                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                      </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No users found.
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

             {/* Action Confirmation Dialog (Example for Block/Unblock) */}
             <AlertDialog open={isActionModalOpen && actionType === 'toggleBlock'} onOpenChange={(open) => !open && setIsActionModalOpen(false)}>
                 <AlertDialogContent>
                     <AlertDialogHeader>
                         <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                         <AlertDialogDescription>
                              Are you sure you want to {selectedUser?.isBlocked ? 'unblock' : 'block'} the user{" "}
                              <span className="font-semibold">{selectedUser?.email}</span>?
                         </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                         <AlertDialogCancel onClick={() => setIsActionModalOpen(false)} disabled={isProcessingAction}>Cancel</AlertDialogCancel>
                         <AlertDialogAction onClick={confirmAction} disabled={isProcessingAction} className={selectedUser?.isBlocked ? "" : "bg-destructive hover:bg-destructive/90"}>
                             {isProcessingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             {selectedUser?.isBlocked ? 'Unblock' : 'Block'}
                         </AlertDialogAction>
                     </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>

             {/* TODO: Add Dialog for Change Role */}

        </div>
    );
};

export default ManageUsersPage;