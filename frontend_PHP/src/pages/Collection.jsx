import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

import Search from "../components/Search";
import { ShopContext } from "../context/ShopContext";
import Item from "../components/Item"; // Đảm bảo Item component hiển thị đúng product data

const Collection = () => {
    const { products, search, backendUrl } = useContext(ShopContext); // Thêm backendUrl
    const [selectedCategories, setSelectedCategories] = useState([]); // Đổi tên state
    const [availableCategories, setAvailableCategories] = useState([]); // State mới cho categories từ API
    const [loadingCategories, setLoadingCategories] = useState(true); // State loading cho categories
    const [sortType, setSortType] = useState("relevant");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const response = await axios.get(`${backendUrl}/api/category`);
            // API CategoryController@index trả về { status: 200, category: [...] }
            if (response.data.status === 200 && Array.isArray(response.data.category)) {
                setAvailableCategories(response.data.category);
            } else {
                console.warn("Could not load categories or invalid format.");
                setAvailableCategories([]);
                 toast.error(response.data.message || "Failed to load categories.");
            }
        } catch (error) {
            console.error("Fetch categories error:", error);
            toast.error("Error loading categories.");
            setAvailableCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    const toggleFilter = useCallback((categoryName, setState) => {
        setState((prev) =>
            prev.includes(categoryName)
                ? prev.filter((item) => item !== categoryName)
                : [...prev, categoryName]
        );
    },[]);

    const applyFilter = useCallback(() => {
        let filtered = [...products];
        if (search) {
            filtered = filtered.filter((product) =>
                product.productName?.toLowerCase().includes(search.toLowerCase()) // Dùng productName
            );
        }
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((product) =>
                 // Giả định product object có nested category object với categoryName
                 product.category && selectedCategories.includes(product.category.categoryName)
            );
        }
        return filtered;
     }, [products, search, selectedCategories]);

    const applySorting = useCallback((productList) => {
        const sortedList = [...productList]; // Create a new array to avoid mutating the original
        switch (sortType) {
            case "low":
                return sortedList.sort((a, b) => a.price - b.price);
            case "high":
                return sortedList.sort((a, b) => b.price - a.price);
            default: // relevant or any other case
                return sortedList; // Return original order (or fetched order)
        }
    }, [sortType]);

    useEffect(() => {
        let filtered = applyFilter();
        let sorted = applySorting(filtered);
        setFilteredProducts(sorted);
        setCurrentPage(1); // Reset page when filters/sort change
    }, [selectedCategories, sortType, products, search, applyFilter, applySorting]);


    const getPaginatedProducts = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
        }
    };


    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">

                <aside className="lg:w-1/4 xl:w-1/5 lg:sticky lg:top-20 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto p-1 space-y-6">
                    <div className="mb-4">
                        <Search />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loadingCategories ? (
                                [...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-3/4" />)
                            ) : availableCategories.length > 0 ? (
                                availableCategories.map((cat) => (
                                    <div key={cat.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`category-${cat.id}`}
                                            checked={selectedCategories.includes(cat.categoryName)}
                                            onCheckedChange={() => toggleFilter(cat.categoryName, setSelectedCategories)}
                                        />
                                        <Label
                                            htmlFor={`category-${cat.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {cat.categoryName}
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No categories available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Sort By</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={sortType} onValueChange={setSortType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select sorting" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevant">Relevant</SelectItem>
                                    <SelectItem value="low">Price: Low to High</SelectItem>
                                    <SelectItem value="high">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </aside>

                <main className="lg:w-3/4 xl:w-4/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getPaginatedProducts().length > 0 ? (
                            getPaginatedProducts().map((product) => (
                                <Item key={product.id} product={product} /> // Sử dụng product.id
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground text-lg">
                                    No products found matching your filters.
                                </p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-14 mb-10 space-x-2">
                            <Button
                               variant="outline"
                               size="icon"
                               disabled={currentPage === 1}
                               onClick={() => handlePageChange(currentPage - 1)}
                               aria-label="Previous page"
                            >
                                <FaChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: totalPages }, (_, index) => (
                               <Button
                                   key={index + 1}
                                   onClick={() => handlePageChange(index + 1)}
                                   variant={currentPage === index + 1 ? "default" : "outline"}
                                   size="icon"
                                   aria-current={currentPage === index + 1 ? 'page' : undefined}
                               >
                                   {index + 1}
                               </Button>
                            ))}

                            <Button
                               variant="outline"
                               size="icon"
                               disabled={currentPage === totalPages}
                               onClick={() => handlePageChange(currentPage + 1)}
                               aria-label="Next page"
                            >
                               <FaChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Collection;
