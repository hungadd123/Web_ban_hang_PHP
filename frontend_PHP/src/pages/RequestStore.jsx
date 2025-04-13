import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const RequestStore = () => {
    const [storeName, setStoreName] = useState("");
    const [description, setDescription] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { backendUrl, token, navigate, fetchUserData } = useContext(ShopContext);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!storeName || !description || !avatarFile) {
            toast.error("Please fill in all fields and upload an avatar.");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append("storeName", storeName);
        formData.append("description", description);
        formData.append("avatar", avatarFile);

        try {
            const response = await axios.post(
                `${backendUrl}/api/store/create`, // <-- SỬ DỤNG LẠI ENDPOINT NÀY
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.status === 201 || response.data.status === 200) {
                toast.success(response.data.message || "Store request submitted successfully. Please wait for approval.");
                setStoreName("");
                setDescription("");
                setAvatarFile(null);
                setAvatarPreview(null);
                if(fetchUserData) await fetchUserData();
                navigate('/profile');
            } else {
                toast.error(response.data.message || "Failed to submit store request.");
            }
        } catch (error) {
            console.error("Store request error:", error);
            toast.error(
                error.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-padd-container py-12 min-h-[calc(100vh-150px)] flex items-center justify-center">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Request Store Opening</CardTitle>
                    <CardDescription className="text-center">Fill in the details below to request opening your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmitHandler} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input
                                id="storeName"
                                type="text"
                                placeholder="Enter your desired store name"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Store Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe your store and products"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Store Avatar/Logo</Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {avatarPreview && (
                                <img src={avatarPreview} alt="Avatar Preview" className="mt-3 h-20 w-20 rounded-full object-cover" />
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestStore;