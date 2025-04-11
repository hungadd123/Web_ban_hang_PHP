// src/components/CreateProductModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Icons
import { Upload, Loader2 } from "lucide-react";

const CreateProductModal = ({
    isOpen,
    onClose,
    createProductData,
    setCreateProductData,
    handleSaveNewProduct,
}) => {
    const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });
    const [imagePreviews, setImagePreviews] = useState({ image1: null, image2: null, image3: null, image4: null });
    const [loading, setLoading] = useState(false);

    // Reset state khi modal đóng/mở lại
    useEffect(() => {
        if (!isOpen) {
            setImages({ image1: null, image2: null, image3: null, image4: null });
            setImagePreviews({ image1: null, image2: null, image3: null, image4: null });
            setLoading(false);
            // Reset createProductData nếu component cha không làm
            // setCreateProductData({ name: "", price: "", description: "", category: "", popular: false, colors: "" });
        }
    }, [isOpen]);

    const handleImageChange = (e, key) => {
        const file = e.target.files?.[0];
        if (file) {
            // Clean up previous preview URL before creating a new one
            if (imagePreviews[key]) {
                URL.revokeObjectURL(imagePreviews[key]);
            }
            setImages((prev) => ({ ...prev, [key]: file }));
            setImagePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
        } else {
             setImages((prev) => ({ ...prev, [key]: null }));
             if (imagePreviews[key]) {
                URL.revokeObjectURL(imagePreviews[key]);
             }
             setImagePreviews((prev) => ({ ...prev, [key]: null }));
        }
    };

     const handleCheckedChange = (checked) => {
        setCreateProductData(prev => ({ ...prev, popular: !!checked }));
     };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // --- Validation (giữ nguyên) ---
        if (!createProductData.name || !createProductData.price || !createProductData.category) {
             return toast.error("Please fill in Name, Price, and Category.");
        }
         if (isNaN(parseFloat(createProductData.price)) || parseFloat(createProductData.price) <= 0) {
            return toast.error("Please enter a valid positive price.");
         }
        const imageFiles = Object.values(images).filter(Boolean);
        if (imageFiles.length === 0) {
            return toast.error("Please upload at least one image.");
        }
        // --- Kết thúc Validation ---

        setLoading(true);
        const formData = new FormData();
        // --- Append FormData (giữ nguyên) ---
        formData.append("name", createProductData.name);
        formData.append("description", createProductData.description);
        formData.append("price", createProductData.price);
        formData.append("category", createProductData.category);
        formData.append("popular", createProductData.popular.toString());
        const colorsArray = createProductData.colors.split(",").map((c) => c.trim().replace(/['"]+/g, '')).filter(Boolean);
        formData.append("colors", JSON.stringify(colorsArray));
        imageFiles.forEach((file, index) => {
            formData.append(`image${index + 1}`, file);
        });
        // --- Kết thúc Append ---

        try {
            await handleSaveNewProduct(formData);
        } catch (error) {
             console.error("Error caught in modal submit:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new product.
                    </DialogDescription>
                </DialogHeader>
                {/* --- SỬA LAYOUT FORM Ở ĐÂY --- */}
                 <form id="product-create-form" onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1"> {/* Thêm space-y, bỏ grid */}

                    {/* Name */}
                    <div className="space-y-1.5"> {/* Nhóm Label và Input */}
                        <Label htmlFor="create-name">Name</Label>
                        <Input
                            id="create-name"
                            value={createProductData.name}
                            onChange={(e) => setCreateProductData({ ...createProductData, name: e.target.value })}
                            placeholder="Product name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-description">Description</Label>
                        <Textarea
                            id="create-description"
                            value={createProductData.description}
                            onChange={(e) => setCreateProductData({ ...createProductData, description: e.target.value })}
                            className="min-h-[100px]"
                            placeholder="Product description"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-price">Price</Label>
                        <Input
                            id="create-price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={createProductData.price}
                            onChange={(e) => setCreateProductData({ ...createProductData, price: e.target.value })}
                            placeholder="Product price"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-category">Category</Label>
                        <Input
                            id="create-category"
                            value={createProductData.category}
                            onChange={(e) => setCreateProductData({ ...createProductData, category: e.target.value })}
                            placeholder="Product category"
                            required
                        />
                        {/* Hoặc dùng Select nếu muốn */}
                        {/* <Select value={createProductData.category} onValueChange={value => setCreateProductData(prev => ({...prev, category: value}))}> ... </Select> */}
                    </div>

                    {/* Colors */}
                    <div className="space-y-1.5">
                        <Label htmlFor="create-colors">Colors</Label>
                        <Input
                            id="create-colors"
                            value={createProductData.colors}
                            onChange={(e) => setCreateProductData({ ...createProductData, colors: e.target.value })}
                            placeholder="Comma-separated, e.g., Red, Blue"
                        />
                    </div>

                    {/* Popular */}
                    <div className="flex items-center space-x-2 pt-2"> {/* Dùng flex để Checkbox và Label cùng hàng */}
                        <Checkbox
                            id="create-popular"
                            checked={createProductData.popular}
                            onCheckedChange={handleCheckedChange}
                        />
                        <Label htmlFor="create-popular" className="text-sm font-medium leading-none cursor-pointer"> {/* Thêm cursor-pointer */}
                            Mark as Popular
                        </Label>
                    </div>

                    {/* Upload Images */}
                    <div className="space-y-2 pt-2">
                         <Label className="text-base">Product Images (up to 4)</Label>
                         <div className="flex flex-wrap gap-4">
                            {["image1", "image2", "image3", "image4"].map((imgKey) => (
                                <Label key={imgKey} htmlFor={imgKey} className="cursor-pointer w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-gray-50 dark:bg-gray-800">
                                    {imagePreviews[imgKey] ? (
                                        <img
                                            src={imagePreviews[imgKey]}
                                            alt={`${imgKey} preview`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                         <Upload className="w-10 h-10" />
                                    )}
                                    <input
                                        onChange={(e) => handleImageChange(e, imgKey)}
                                        type="file"
                                        accept="image/*"
                                        id={imgKey}
                                        hidden
                                    />
                                </Label>
                            ))}
                        </div>
                    </div>
                 </form>
                 {/* --- KẾT THÚC SỬA LAYOUT FORM --- */}
                 <DialogFooter className="pt-4 border-t">
                     <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={loading}>
                            Cancel
                        </Button>
                     </DialogClose>
                    <Button type="submit" form="product-create-form" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Product
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProductModal;