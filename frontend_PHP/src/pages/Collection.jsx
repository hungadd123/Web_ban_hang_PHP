import React, { useContext, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Icons remain useful

// Import Shadcn UI components (adjust paths based on your setup)
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

// Your existing imports
import Search from "../components/Search"; // Assuming Search might use shadcn/ui Input internally
import { ShopContext } from "../context/ShopContext";
import Item from "../components/Item"; // Assuming Item is styled, potentially using shadcn/ui Card

const Collection = () => {
  const { products, search } = useContext(ShopContext);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjust items per page

  // --- Filtering and Sorting Logic (NO CHANGES NEEDED HERE) ---
  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilter = () => {
    let filtered = [...products];
    if (search) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category.length) {
      filtered = filtered.filter((product) =>
        category.includes(product.category)
      );
    }
    return filtered;
  };

  const applySorting = (productList) => {
    const sortedList = productList.slice();
    switch (sortType) {
      case "low":
        return sortedList.sort((a, b) => a.price - b.price);
      case "high":
        return sortedList.sort((a, b) => b.price - a.price);
      default:
        return sortedList;
    }
  };

  useEffect(() => {
    let filtered = applyFilter();
    let sorted = applySorting(filtered);
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [category, sortType, products, search]);
  // --- End Filtering/Sorting Logic ---

  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    }
  };

  // Helper function to generate unique IDs for checkboxes
  const generateCheckboxId = (cat) => `category-${cat.replace(/\s+/g, '-')}`;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* --- FILTERS SIDEBAR (Using Shadcn Card) --- */}
        <aside className="lg:w-1/4 xl:w-1/5 lg:sticky lg:top-20 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto p-1 space-y-6">
          {/* Search */}
          <div className="mb-4"> {/* Add margin bottom to search if needed */}
              <Search />
          </div>


          {/* Categories Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Đồ bơi",
                "Áo khoác",
                "Áo thun",
                "Quần tây",
                "Quần rin",
                "Áo sơ mi",
              ].map((cat) => {
                const checkboxId = generateCheckboxId(cat);
                return (
                  <div key={cat} className="flex items-center space-x-3">
                    <Checkbox
                      id={checkboxId}
                      checked={category.includes(cat)}
                      onCheckedChange={(checked) => {
                        // checked can be boolean or 'indeterminate'
                        if (checked === true) {
                          toggleFilter(cat, setCategory);
                        } else if (checked === false) {
                          toggleFilter(cat, setCategory); // Call toggle again to remove
                        }
                      }}
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {cat}
                    </Label>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Sort By Filter (Using Shadcn Select) */}
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

        {/* --- PRODUCTS GRID & PAGINATION --- */}
        <main className="lg:w-3/4 xl:w-4/5">
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getPaginatedProducts().length > 0 ? (
              getPaginatedProducts().map((product) => (
                <Item key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground text-lg"> {/* Use shadcn muted color */}
                  No products found matching your filters.
                </p>
              </div>
            )}
          </div>

          {/* --- PAGINATION (Using Shadcn Button) --- */}
          {totalPages > 1 && (
             <div className="flex justify-center items-center mt-14 mb-10 space-x-2">
               {/* Previous Button */}
               <Button
                 variant="outline"
                 size="icon" // Make it square for icon
                 disabled={currentPage === 1}
                 onClick={() => handlePageChange(currentPage - 1)}
                 aria-label="Previous page"
               >
                  <FaChevronLeft className="h-4 w-4" />
               </Button>

               {/* Page Number Buttons */}
               {Array.from({ length: totalPages }, (_, index) => (
                 <Button
                   key={index + 1}
                   onClick={() => handlePageChange(index + 1)}
                   variant={currentPage === index + 1 ? "default" : "outline"} // "default" likely your black button
                   size="icon" // Make it square
                   aria-current={currentPage === index + 1 ? 'page' : undefined}
                 >
                   {index + 1}
                 </Button>
               ))}

               {/* Next Button */}
               <Button
                 variant="outline"
                 size="icon" // Make it square
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