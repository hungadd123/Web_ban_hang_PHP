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
import { Upload, Loader2 } from "lucide-react";

const CreateProductModal = ({
    isOpen,
    onClose,
    handleSaveNewProduct,
    storeId // <-- Nhận storeId từ props
}) => {
    const [productData, setProductData] = useState({
        productName: "",
        productDetail: "",
        price: "",
        category_id: "",
        remainQuantity: "",
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [detailImageFiles, setDetailImageFiles] = useState([]);
    const [detailImagePreviews, setDetailImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const { backendUrl } = useContext(ShopContext);


    const resetForm = () => {
        setProductData({ productName: "", productDetail: "", price: "", category_id: "", remainQuantity: "" });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setDetailImageFiles([]);
        setDetailImagePreviews([]);
        setLoading(false);
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        } else {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await axios.get(`${backendUrl}/api/category`);
            if (response.data.status === 200 && Array.isArray(response.data.category)) {
                setCategories(response.data.category);
            } else {
                 toast.error("Could not load categories.");
                 setCategories([]);
            }
        } catch (error) {
            toast.error("Error loading categories.");
            console.error("Fetch categories error:", error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value) => {
        setProductData(prev => ({ ...prev, category_id: value }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
            setThumbnailFile(null);
            setThumbnailPreview(null);
        }
    };

    const handleDetailImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            detailImagePreviews.forEach(URL.revokeObjectURL);
            const limitedFiles = files.slice(0, 5);
            setDetailImageFiles(limitedFiles);
            setDetailImagePreviews(limitedFiles.map(file => URL.createObjectURL(file)));
        } else {
            detailImagePreviews.forEach(URL.revokeObjectURL);
            setDetailImageFiles([]);
            setDetailImagePreviews([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || !storeId) { // Thêm kiểm tra storeId
             if(!storeId) toast.error("Store ID is missing.");
             return;
        }

        if (!productData.productName || !productData.price || !productData.category_id || !productData.remainQuantity) {
            return toast.error("Please fill in Name, Price, Category, and Quantity.");
        }
        if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
            return toast.error("Please enter a valid positive price.");
        }
        if (isNaN(parseInt(productData.remainQuantity)) || parseInt(productData.remainQuantity) < 0) {
            return toast.error("Please enter a valid non-negative quantity.");
        }
        if (!thumbnailFile) {
            return toast.error("Please upload a thumbnail image.");
        }
        if (detailImageFiles.length < 2) {
            return toast.error("Please upload at least two detail images.");
        }

        setLoading(true);
        const formData = new FormData();

        formData.append("productName", productData.productName);
        formData.append("productDetail", productData.productDetail);
        formData.append("price", productData.price);
        formData.append("category_id", productData.category_id);
        formData.append("remainQuantity", productData.remainQuantity);
        formData.append("store_id", storeId); // <-- THÊM store_id VÀO ĐÂY
        if(thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
        }
        detailImageFiles.forEach((file) => {
            formData.append('imageDetails[]', file);
        });


        try {
            await handleSaveNewProduct(formData);
            onClose();
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
                <form id="product-create-form" onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="productName">Name</Label>
                        <Input
                            id="productName"
                            name="productName"
                            value={productData.productName}
                            onChange={handleInputChange}
                            placeholder="Product name"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="productDetail">Description</Label>
                        <Textarea
                            id="productDetail"
                            name="productDetail"
                            value={productData.productDetail}
                            onChange={handleInputChange}
                            className="min-h-[100px]"
                            placeholder="Product description"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                               <Label htmlFor="price">Price</Label>
                               <Input
                                   id="price"
                                   name="price"
                                   type="number"
                                   step="1000"
                                   min="0"
                                   value={productData.price}
                                   onChange={handleInputChange}
                                   placeholder="Product price (e.g., 50000)"
                                   required
                               />
                           </div>
                           <div className="space-y-1.5">
                               <Label htmlFor="remainQuantity">Quantity</Label>
                               <Input
                                   id="remainQuantity"
                                   name="remainQuantity"
                                   type="number"
                                   min="0"
                                   step="1"
                                   value={productData.remainQuantity}
                                   onChange={handleInputChange}
                                   placeholder="Initial stock quantity"
                                   required
                               />
                           </div>
                    </div>

                    <div className="space-y-1.5">
                       <Label htmlFor="category_id">Category</Label>
                        <Select
                           value={productData.category_id}
                           onValueChange={handleCategoryChange}
                           required
                        >
                           <SelectTrigger id="category_id">
                               <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                           </SelectTrigger>
                           <SelectContent>
                               {!loadingCategories && categories.length > 0 ? (
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

                    <div className="space-y-2 pt-2">
                       <Label htmlFor="thumbnail">Thumbnail Image (Required)</Label>
                       <Input
                           id="thumbnail"
                           type="file"
                           accept="image/*"
                           onChange={handleThumbnailChange}
                           className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                           required
                       />
                       {thumbnailPreview && (
                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="mt-2 h-24 w-24 rounded-lg object-cover border"/>
                       )}
                   </div>

                    <div className="space-y-2 pt-2">
                       <Label htmlFor="detailImages">Detail Images (Min. 2 Required)</Label>
                       <Input
                           id="detailImages"
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleDetailImagesChange}
                           className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                           required
                        />
                        {detailImagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {detailImagePreviews.map((previewUrl, index) => (
                                    <img key={index} src={previewUrl} alt={`Detail Preview ${index + 1}`} className="h-20 w-20 rounded-lg object-cover border"/>
                                ))}
                            </div>
                        )}
                   </div>
                </form>
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