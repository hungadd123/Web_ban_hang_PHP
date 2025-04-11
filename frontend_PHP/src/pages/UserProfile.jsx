// src/pages/UserProfile.jsx
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Thêm Dialog
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Thêm Tooltip

// Import Icons
import { User, Mail, Phone, MapPin, Edit, LogOut, Store, Package, Settings, AlertCircle, Loader2, Camera, Upload } from 'lucide-react'; // Thêm Camera, Upload

import Footer from '../components/Footer';

const UserProfile = () => {
    const {
        user, token, loading: contextLoading, backendUrl, setToken,
        setUser, fetchUserData, storeInfo, updateStoreInfoContext
    } = useContext(ShopContext);

    const navigate = useNavigate();

    // State cho edit profile
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', address: '' });
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

    // State cho avatar modal
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    // Cập nhật profileData khi user context thay đổi
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '', email: user.email || '',
                phone: user.phone || '', address: user.address || '',
            });
            setAvatarPreview(null); // Reset preview khi user data thay đổi
            setAvatarFile(null);    // Reset file khi user data thay đổi
        } else {
            setProfileData({ name: '', email: '', phone: '', address: '' });
        }
    }, [user]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Logout ---
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("storeInfo");
        updateStoreInfoContext(null);
        setToken("");
        setUser(null);
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    // --- Edit/Cancel Profile ---
    const handleEditToggle = () => {
        if (isEditing && user) {
            setProfileData({ // Reset về dữ liệu gốc khi cancel
                name: user.name || '', email: user.email || '',
                phone: user.phone || '', address: user.address || '',
            });
        }
        setIsEditing(!isEditing);
    };

    // --- Save Profile ---
    const handleSaveProfile = async () => {
        if (!token) return toast.error("Authentication error.");
        setIsLoadingUpdate(true);
        try {
            const response = await axios.put(`${backendUrl}/api/user/profile`,
                { name: profileData.name, phone: profileData.phone, address: profileData.address },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                await fetchUserData(); // Fetch lại data user mới nhất
                setIsEditing(false);
            } else {
                toast.error(response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Error updating profile.");
        } finally {
            setIsLoadingUpdate(false);
        }
    };

    // --- Avatar Upload ---
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Tạo URL tạm để preview
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return toast.error("Please select an image file first.");
        if (!token) return toast.error("Authentication error.");

        setIsAvatarUploading(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile); // Tên field phải khớp với backend (Multer)

        try {
            const response = await axios.put(`${backendUrl}/api/user/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    token: token
                }
            });

            if (response.data.success) {
                toast.success("Avatar updated successfully!");
                await fetchUserData(); // Fetch lại data user (bao gồm cả ảnh mới)
                setIsAvatarModalOpen(false); // Đóng modal
                setAvatarFile(null);       // Reset state
                setAvatarPreview(null);    // Reset state
            } else {
                toast.error(response.data.message || "Failed to upload avatar.");
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error(error.response?.data?.message || "Error uploading avatar.");
        } finally {
            setIsAvatarUploading(false);
        }
    };


 
    if ((contextLoading && !user && token) || (!user && token && !contextLoading)) { // Điều kiện bao quát hơn
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4"> {/* Chiều cao trừ header/footer */}
                <Loader2 className="h-12 w-12 animate-spin text-primary" /> {/* Icon quay tròn */}
                <p className="mt-4 text-muted-foreground">Loading profile...</p> {/* Thêm text */}
            </div>
        );
    }

   if (!token) {
       return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
                <Alert variant="default" className="max-w-sm mb-4 bg-card border dark:border-gray-700">
                   <AlertCircle className="h-5 w-5" /> {/* Icon cảnh báo */}
                   <AlertTitle>Not Logged In</AlertTitle>
                   <AlertDescription>
                       Please log in to view your profile page.
                   </AlertDescription>
                </Alert>
               <Button onClick={() => navigate('/login')}>Go to Login</Button>
           </div>
       );
   }

     if (token && !user && !contextLoading) {
       return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
                <Alert variant="destructive" className="max-w-sm mb-4"> {/* Alert màu đỏ */}
                   <AlertCircle className="h-5 w-5" />
                   <AlertTitle>Error Loading Profile</AlertTitle>
                   <AlertDescription>
                       Could not load your profile data. Your session might be invalid. Please try logging out and back in.
                    </AlertDescription>
                </Alert>
                 <Button onClick={handleLogout} variant="outline">Logout</Button>
           </div>
       );
   }
    // --- Main Render ---
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-foreground">My Profile</h1>
            <Card className="overflow-hidden shadow-lg dark:border-gray-700">
                <CardHeader className="bg-card p-6 border-b dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Avatar và nút Upload */}
                        <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-primary/20 dark:border-primary/40">
                            <AvatarImage src={user?.image || '/default-avatar.png'} alt={user?.name || 'User Avatar'} />
                            <AvatarFallback className="text-3xl bg-muted">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User />}
                            </AvatarFallback>
                        </Avatar>                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 opacity-80 hover:opacity-100 transition-opacity group-hover:opacity-100"
                                onClick={() => setIsAvatarModalOpen(true)}
                            >
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">Change Avatar</span>
                            </Button>
                        </div>

                        <div className="text-center sm:text-left flex-grow">
                            <CardTitle className="text-2xl">{profileData.name || "..."}</CardTitle>
                            <CardDescription>{profileData.email || "..."}</CardDescription>
                        </div>

                        {/* --- SỬA LẠI KHỐI NÚT EDIT/SAVE/CANCEL --- */}
                        <div className="sm:ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                            {isEditing ? (
                                <>
                                    {/* THÊM LẠI NÚT SAVE VÀ CANCEL */}
                                    <Button size="sm" onClick={handleSaveProfile} disabled={isLoadingUpdate}>
                                        {isLoadingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isLoadingUpdate}>
                                        Cancel
                                    </Button>
                                    {/* KẾT THÚC THÊM LẠI */}
                                </>
                            ) : (
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={handleEditToggle}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit your profile details</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-6">
                             {/* Thông tin chi tiết với Icon */}
                            <div className="flex items-start gap-4">
                                <User className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0"/>
                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                    <Label htmlFor="name" className="sm:col-span-1 text-muted-foreground pt-2">Name</Label>
                                    <div className="sm:col-span-2">
                                        {isEditing ? <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} disabled={isLoadingUpdate} /> : <p className="font-medium text-foreground py-2">{profileData.name || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
                                    </div>
                                </div>
                            </div>
                            <Separator/>
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                    <Label className="sm:col-span-1 text-muted-foreground">Email</Label>
                                    <p className="sm:col-span-2 font-medium text-muted-foreground py-2">{profileData.email || '-'}</p>
                                </div>
                            </div>
                             <Separator/>
                            <div className="flex items-start gap-4">
                                <Phone className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0"/>
                                 <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                    <Label htmlFor="phone" className="sm:col-span-1 text-muted-foreground pt-2">Phone</Label>
                                    <div className="sm:col-span-2">
                                        {isEditing ? <Input id="phone" name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} disabled={isLoadingUpdate} placeholder="Add phone number"/> : <p className="font-medium text-foreground py-2">{profileData.phone || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
                                    </div>
                                </div>
                            </div>
                             <Separator/>
                             <div className="flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0"/>
                                 <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                    <Label htmlFor="address" className="sm:col-span-1 text-muted-foreground pt-2">Address</Label>
                                    <div className="sm:col-span-2">
                                        {isEditing ? <Input id="address" name="address" value={profileData.address} onChange={handleInputChange} disabled={isLoadingUpdate} placeholder="Add shipping address"/> : <p className="font-medium text-foreground py-2 whitespace-pre-line">{profileData.address || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Quick Links */}
                        <div>
                             <h4 className="font-semibold mb-4 text-lg text-foreground">Quick Links</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                    <Link to="/orders"> <Package className="h-5 w-5" /> My Orders </Link>
                                </Button>
                                 {storeInfo ? (
                                      <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                        <Link to="/my-store"> <Store className="h-5 w-5" /> My Store </Link>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                        <Link to="/request-store"> <Store className="h-5 w-5" /> Open Your Store </Link>
                                    </Button>
                                )}
                                {/* Add Settings link later if needed */}
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="border-t p-4 bg-muted/50 dark:border-gray-700">
                          <Button variant="destructive" onClick={handleLogout} size="sm">
                             <LogOut className="mr-2 h-4 w-4" /> Logout
                         </Button>
                    </CardFooter>
                </Card>
            </main>

             {/* Avatar Upload Modal */}
            <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                            Choose a new avatar image to upload.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                             <Avatar className="h-32 w-32 mb-4 border">
                                {/* Hiển thị preview hoặc ảnh hiện tại */}
                                <AvatarImage src={avatarPreview || user?.image || '/default-avatar.png'} alt="Avatar Preview" />
                                <AvatarFallback className="text-4xl">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User />}
                                </AvatarFallback>
                            </Avatar>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                             {avatarPreview && <p className="text-xs text-muted-foreground">New image selected.</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAvatarModalOpen(false); setAvatarPreview(null); setAvatarFile(null); }}>Cancel</Button>
                        <Button onClick={handleAvatarUpload} disabled={!avatarFile || isAvatarUploading}>
                            {isAvatarUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4"/>}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Footer />
        </div>
    );
};

export default UserProfile;