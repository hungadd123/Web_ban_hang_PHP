import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { User, Mail, Phone, MapPin, Edit, LogOut, Store as StoreIconLucide, Package, Settings, AlertCircle, Loader2, Camera, Upload, XCircle, Clock } from 'lucide-react'; // Đổi tên Store thành StoreIconLucide

import Footer from '../components/Footer';

const UserProfile = () => {
    const {
        user, token, loading: contextLoading, backendUrl, setToken,
        setUser, fetchUserData, storeInfo, updateStoreInfoContext
    } = useContext(ShopContext);

    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    // Sửa state profileData để khớp với các trường riêng lẻ
    const [profileData, setProfileData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', address: ''
    });
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                // Sử dụng firstName, lastName nếu có, nếu không thì để rỗng
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',     // Giả định API trả về phone
                address: user.address || '', // Giả định API trả về address
            });
            setAvatarPreview(null);
            setAvatarFile(null);
        } else {
            setProfileData({ firstName: '', lastName: '', email: '', phone: '', address: '' });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("storeInfo");
        updateStoreInfoContext(null);
        setToken("");
        setUser(null);
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    const handleEditToggle = () => {
        if (isEditing && user) {
            setProfileData({ // Reset về dữ liệu gốc khi cancel
                 firstName: user.firstName || '', lastName: user.lastName || '',
                 email: user.email || '', phone: user.phone || '', address: user.address || '',
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        if (!token) return toast.error("Authentication error.");
        setIsLoadingUpdate(true);
        try {
             // Chuẩn bị payload đúng với các trường backend mong đợi
            const payload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                address: profileData.address
                 // Email thường không cho đổi hoặc đổi qua quy trình riêng
            };
             // Gọi đúng endpoint và phương thức POST (thường dùng POST cho update profile API)
             const response = await axios.post(`${backendUrl}/api/user/update-profile`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } } // Header đúng
            );
            // Kiểm tra success flag trong data trả về (nếu có) hoặc status code
            if (response.data?.success || response.status === 200) {
                toast.success(response.data?.message || "Profile updated successfully!");
                await fetchUserData(); // Fetch lại data user mới nhất
                setIsEditing(false);
            } else {
                toast.error(response.data?.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
             // Hiển thị lỗi validation nếu backend trả về
             if (error.response?.data?.errors) {
                  const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                  toast.error(`Validation failed:\n${errorMessages}`);
             } else {
                 toast.error(error.response?.data?.message || "Error updating profile.");
             }
        } finally {
            setIsLoadingUpdate(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
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
        formData.append('avatar', avatarFile);

        try {
             // Giả sử endpoint là POST /api/user/avatar
            const response = await axios.post(`${backendUrl}/api/user/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` // Sửa header
                }
            });

             if (response.data?.success || response.status === 200) {
                toast.success(response.data?.message || "Avatar updated successfully!");
                await fetchUserData();
                setIsAvatarModalOpen(false);
                setAvatarFile(null);
                setAvatarPreview(null);
            } else {
                toast.error(response.data?.message || "Failed to upload avatar.");
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error(error.response?.data?.message || "Error uploading avatar.");
        } finally {
            setIsAvatarUploading(false);
        }
    };


    // --- Render States ---
     if (contextLoading && !user && token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading profile...</p>
                <Footer/>
            </div>
        );
    }

    if (!token) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
               <Alert variant="default" className="max-w-sm mb-4 bg-card border dark:border-gray-700">
                   <AlertCircle className="h-5 w-5" />
                   <AlertTitle>Not Logged In</AlertTitle>
                   <AlertDescription>Please log in to view your profile page.</AlertDescription>
               </Alert>
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
               <Footer/>
           </div>
        );
   }

   if (token && !user && !contextLoading) {
       return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
               <Alert variant="destructive" className="max-w-sm mb-4">
                   <AlertCircle className="h-5 w-5" />
                   <AlertTitle>Error Loading Profile</AlertTitle>
                   <AlertDescription>Could not load your profile data. Your session might be invalid. Please try logging out and back in.</AlertDescription>
               </Alert>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
                <Footer/>
           </div>
       );
   }

   // Cần kiểm tra user có tồn tại trước khi truy cập thuộc tính
   if (!user) {
        // Có thể hiển thị một trạng thái lỗi khác hoặc quay về trang chủ
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
                  <p>User data not available.</p>
                  <Footer/>
             </div>
        );
    }


    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-foreground">My Profile</h1>
            <Card className="overflow-hidden shadow-lg dark:border-gray-700">
                <CardHeader className="bg-card p-6 border-b dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-primary/20 dark:border-primary/40">
                            <AvatarImage src={user.avatar || '/default-avatar.png'} alt={`${user.firstName || ''} ${user.lastName || 'User Avatar'}`} />
                            <AvatarFallback className="text-3xl bg-muted">
                                 {/* Hiển thị chữ cái đầu của firstName hoặc User icon */}
                                {user.firstName ? user.firstName.charAt(0).toUpperCase() : <User />}
                            </AvatarFallback>
                        </Avatar>
                         <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 opacity-80 hover:opacity-100 transition-opacity group-hover:opacity-100" onClick={() => setIsAvatarModalOpen(true)} >
                             <Camera className="h-4 w-4" />
                             <span className="sr-only">Change Avatar</span>
                         </Button>
                        </div>

                        <div className="text-center sm:text-left flex-grow">
                             {/* Hiển thị firstName lastName */}
                             <CardTitle className="text-2xl">{profileData.firstName || profileData.lastName ? `${profileData.firstName} ${profileData.lastName}`.trim() : 'User Name'}</CardTitle>
                             <CardDescription>{profileData.email || "..."}</CardDescription>
                        </div>

                        <div className="sm:ml-auto mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                            {isEditing ? (
                                <>
                                    <Button size="sm" onClick={handleSaveProfile} disabled={isLoadingUpdate}>
                                        {isLoadingUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isLoadingUpdate}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={handleEditToggle}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Edit your profile details</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </CardHeader>

                     <CardContent className="p-6 space-y-6">
                         <div className="space-y-6">
                             <div className="flex items-start gap-4">
                                 <User className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0"/>
                                 <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                     <Label htmlFor="firstName" className="sm:col-span-1 text-muted-foreground pt-2">First Name</Label>
                                     <div className="sm:col-span-2">
                                          {isEditing ? <Input id="firstName" name="firstName" value={profileData.firstName} onChange={handleInputChange} disabled={isLoadingUpdate} /> : <p className="font-medium text-foreground py-2">{profileData.firstName || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
                                     </div>
                                 </div>
                             </div>
                             <Separator/>
                              <div className="flex items-start gap-4">
                                 <User className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0 opacity-0"/> {/* Placeholder for alignment */}
                                 <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-1">
                                     <Label htmlFor="lastName" className="sm:col-span-1 text-muted-foreground pt-2">Last Name</Label>
                                     <div className="sm:col-span-2">
                                          {isEditing ? <Input id="lastName" name="lastName" value={profileData.lastName} onChange={handleInputChange} disabled={isLoadingUpdate} /> : <p className="font-medium text-foreground py-2">{profileData.lastName || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
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
                                          {isEditing ? <Textarea id="address" name="address" value={profileData.address} onChange={handleInputChange} disabled={isLoadingUpdate} placeholder="Add shipping address" className="min-h-[80px]" /> : <p className="font-medium text-foreground py-2 whitespace-pre-line">{profileData.address || <span className="text-xs text-muted-foreground italic">Not set</span>}</p>}
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <Separator className="my-8" />

                         <div>
                             <h4 className="font-semibold mb-4 text-lg text-foreground">Quick Links</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                     <Link to="/orders"> <Package className="h-5 w-5" /> My Orders </Link>
                                 </Button>
                                  {storeInfo && storeInfo.status === 'approved' ? (
                                       <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                           <Link to="/my-store"> <StoreIconLucide className="h-5 w-5" /> My Store </Link>
                                       </Button>
                                   ) : storeInfo && storeInfo.status !== 'approved' ? (
                                      <Button variant="ghost" className="justify-start gap-2 text-muted-foreground opacity-70 cursor-not-allowed">
                                           {storeInfo.status === 'pending' ? <Clock className="mr-2 h-4 w-4 text-yellow-500"/> : <XCircle className="mr-2 h-4 w-4 text-red-500"/>}
                                           Store: <span className='ml-1 capitalize'>{storeInfo.status}</span>
                                      </Button>
                                   ) : (
                                       <Button variant="ghost" asChild className="justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10">
                                           <Link to="/request-store"> <StoreIconLucide className="h-5 w-5" /> Open Your Store </Link>
                                       </Button>
                                  )}
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

              <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                          <DialogTitle>Update Profile Picture</DialogTitle>
                          <DialogDescription>Choose a new avatar image to upload.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="flex flex-col items-center gap-4">
                              <Avatar className="h-32 w-32 mb-4 border">
                                  <AvatarImage src={avatarPreview || user?.avatar || '/default-avatar.png'} alt="Avatar Preview" />
                                  <AvatarFallback className="text-4xl">
                                       {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User />}
                                  </AvatarFallback>
                              </Avatar>
                              <Input id="avatar-upload" type="file" accept="image/*" onChange={handleFileSelect} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
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