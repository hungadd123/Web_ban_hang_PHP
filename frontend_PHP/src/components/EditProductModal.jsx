import React, { useState, useEffect, useContext } from "react";
import { toast } from 'react-toastify';
import { ShopContext } from "../context/ShopContext";
import axios from 'axios';

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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImagePlus, Replace, Trash2 } from "lucide-react"; // Thêm Replace, Trash2
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EditProductModal = ({
    isOpen,
    onClose,
    editingProduct,
    handleSaveProduct,
    isLoading,
    categories
}) => {
    const [internalEditData, setInternalEditData] = useState({
        productName: "",
        productDetail: "",
        price: "",
        category_id: "",
        remainQuantity: "",
    });
    const [newThumbnailFile, setNewThumbnailFile] = useState(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
    const [newDetailImageFiles, setNewDetailImageFiles] = useState([]);
    const [newDetailImagePreviews, setNewDetailImagePreviews] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const { backendUrl } = useContext(ShopContext);

    const currentThumbnailUrl = editingProduct?.images?.[0] || '/placeholder-image.png';
    const currentDetailImageUrls = editingProduct?.images?.slice(1) || [];

    useEffect(() => {
        if (isOpen && editingProduct) {
            setInternalEditData({
                productName: editingProduct.productName || "",
                productDetail: editingProduct.productDetail || "",
                price: editingProduct.price || "",
                category_id: String(editingProduct.category_id || ""),
                remainQuantity: editingProduct.remainQuantity ?? "", // Use ?? for 0 value
            });
            setNewThumbnailFile(null);
            setNewThumbnailPreview(null);
            setNewDetailImageFiles([]);
            setNewDetailImagePreviews([]);
            if (!categories || categories.length === 0) {
                 fetchCategories(); // Fetch if not passed down or empty
             }
        } else if (!isOpen) {
            resetForm();
        }
    }, [editingProduct, isOpen, categories]); // Thêm categories vào dependency

    const resetForm = () => {
         setInternalEditData({ productName: "", productDetail: "", price: "", category_id: "", remainQuantity: "" });
         setNewThumbnailFile(null);
         setNewThumbnailPreview(null);
         setNewDetailImageFiles([]);
         setNewDetailImagePreviews([]);
    };

     const fetchCategories = async () => {
        setLoadingCategories(true);
         try {
             const response = await axios.get(`${backendUrl}/api/category`);
             if (response.data.status === 200 && Array.isArray(response.data.category)) {
                 // Potentially update a local categories state if needed,
                 // but relying on the passed prop is usually better.
             } else {
                  console.warn("Could not load categories in Edit Modal.");
             }
         } catch (error) {
             console.error("Fetch categories error in Edit Modal:", error);
         } finally {
             setLoadingCategories(false);
         }
     };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInternalEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value) => {
        setInternalEditData(prev => ({ ...prev, category_id: value }));
    };

    const handleNewThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (newThumbnailPreview) URL.revokeObjectURL(newThumbnailPreview);
            setNewThumbnailFile(file);
            setNewThumbnailPreview(URL.createObjectURL(file));
        } else {
             if (newThumbnailPreview) URL.revokeObjectURL(newThumbnailPreview);
            setNewThumbnailFile(null);
            setNewThumbnailPreview(null);
        }
    };

    const handleNewDetailImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            newDetailImagePreviews.forEach(URL.revokeObjectURL);
            const limitedFiles = files.slice(0, 5);
            setNewDetailImageFiles(limitedFiles);
            setNewDetailImagePreviews(limitedFiles.map(file => URL.createObjectURL(file)));
        } else {
            newDetailImagePreviews.forEach(URL.revokeObjectURL);
            setNewDetailImageFiles([]);
            setNewDetailImagePreviews([]);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading || !editingProduct?.id) return;

        const priceAsNumber = parseFloat(internalEditData.price);
        const quantityAsNumber = parseInt(internalEditData.remainQuantity, 10);

        if (isNaN(priceAsNumber) || priceAsNumber < 0) return toast.error("Valid positive price required.");
        if (isNaN(quantityAsNumber) || quantityAsNumber < 0) return toast.error("Valid non-negative quantity required.");
        if (!internalEditData.productName || !internalEditData.category_id) return toast.error("Name and Category are required.");


        const formData = new FormData();
        formData.append("productName", internalEditData.productName);
        formData.append("productDetail", internalEditData.productDetail);
        formData.append("price", priceAsNumber);
        formData.append("category_id", internalEditData.category_id);
        formData.append("remainQuantity", quantityAsNumber);

        if (newThumbnailFile) {
            formData.append("thumbnail", newThumbnailFile);
        }

        if (newDetailImageFiles.length > 0) {
             newDetailImageFiles.forEach((file) => {
                formData.append('imageDetails[]', file);
             });
        }


        handleSaveProduct(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Product</DialogTitle>
                    <DialogDescription>
                        Make changes to: <span className="font-medium">{editingProduct?.productName}</span>
                    </DialogDescription>
                </DialogHeader>
                <form id="product-edit-form" onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="productName">Name</Label>
                        <Input id="productName" name="productName" value={internalEditData.productName} onChange={handleInputChange} required disabled={isLoading} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="productDetail">Description</Label>
                        <Textarea id="productDetail" name="productDetail" value={internalEditData.productDetail} onChange={handleInputChange} className="min-h-[100px]" disabled={isLoading} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" name="price" type="number" step="1000" min="0" value={internalEditData.price} onChange={handleInputChange} required disabled={isLoading} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="remainQuantity">Quantity</Label>
                            <Input id="remainQuantity" name="remainQuantity" type="number" min="0" step="1" value={internalEditData.remainQuantity} onChange={handleInputChange} required disabled={isLoading} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="category_id">Category</Label>
                        <Select value={internalEditData.category_id} onValueChange={handleCategoryChange} required disabled={isLoading || loadingCategories}>
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                            </SelectTrigger>
                            <SelectContent>
                                {!loadingCategories && categories && categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.categoryName}
                                        </SelectItem>
                                    ))
                                ) : !loadingCategories ? (
                                    <SelectItem value="no-cat" disabled>No categories found</SelectItem>
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>

                     <div className="space-y-2 pt-2 border-t mt-4 pt-4">
                       <Label>Thumbnail Image</Label>
                       <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 rounded border">
                                <AvatarImage src={newThumbnailPreview || currentThumbnailUrl} alt="Current/New Thumbnail"/>
                                <AvatarFallback><ImagePlus/></AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <Label htmlFor="newThumbnail" className="text-xs text-muted-foreground flex items-center gap-1"><Replace className="w-3 h-3"/> Replace Thumbnail (Optional)</Label>
                                <Input
                                    id="newThumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleNewThumbnailChange}
                                    className="mt-1 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-muted-foreground hover:file:bg-accent"
                                    disabled={isLoading}
                                />
                            </div>
                       </div>
                   </div>

                    <div className="space-y-2 pt-2 border-t mt-4 pt-4">
                       <Label>Detail Images</Label>
                       <p className="text-xs text-muted-foreground">Current detail images (Deletion not supported yet). You can add more below.</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                             {currentDetailImageUrls.map((url, index) => (
                                <div key={`current-${index}`} className="relative group">
                                    <img src={url} alt={`Current Detail ${index + 1}`} className="h-16 w-16 rounded-lg object-cover border"/>
                                </div>
                            ))}
                            {currentDetailImageUrls.length === 0 && <p className="text-xs italic text-muted-foreground">No current detail images.</p>}
                        </div>

                       <Label htmlFor="newDetailImages" className="text-sm pt-3 block">Add More Detail Images (Optional)</Label>
                       <Input
                           id="newDetailImages"
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleNewDetailImagesChange}
                           className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-muted-foreground hover:file:bg-accent"
                           disabled={isLoading}
                        />
                        {newDetailImagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {newDetailImagePreviews.map((previewUrl, index) => (
                                    <img key={`new-${index}`} src={previewUrl} alt={`New Detail Preview ${index + 1}`} className="h-16 w-16 rounded-lg object-cover border"/>
                                ))}
                            </div>
                        )}
                   </div>


                </form>
                <DialogFooter className="pt-4 border-t">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="product-edit-form" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductModal;