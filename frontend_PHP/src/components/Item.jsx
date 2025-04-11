import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const Item = ({ product, className }) => {
  const [hovered, setHovered] = useState(false);

  // --- Loading State ---
  if (!product || !product.image || product.image.length === 0) {
    // Có thể giữ nguyên hoặc tùy chỉnh thêm nếu muốn
    return (
      <Card className={cn("overflow-hidden group animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-lg", className)}>
         {/* Có thể thêm các khối placeholder mờ bên trong */}
      </Card>
    );
  }

  // --- Render Product Card ---
  return (
    // Bỏ border mặc định, thêm border + bg nhẹ khi hover
    <Card
      className={cn(
        "overflow-hidden group border border-transparent rounded-lg", // Bỏ border-border, thêm border-transparent
        "hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700", // Thêm border khi hover
        "hover:bg-gray-50/50 dark:hover:bg-gray-900/50", // Thêm bg nhẹ khi hover (tùy chọn)
        "transition-all duration-300 ease-in-out", // Thêm transition chung
        className
      )}
      onMouseEnter={() => setHovered(true)} // Chuyển hover state lên Card chính
      onMouseLeave={() => setHovered(false)}
    >
      <CardHeader className="p-0 relative">
        {/* Link bao quanh ảnh */}
        <Link
          to={`/product/${product.id}`}
          className="aspect-square block overflow-hidden rounded-t-lg" // Bo góc trên cho khớp Card
        >
          <img
            src={
              // Hiển thị ảnh thứ 2 khi hover (nếu có)
              product.image.length > 1 && hovered
                ? product.image[1]
                : product.image[0]
            }
            alt={product.name || "Product Image"}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" // Giữ hiệu ứng zoom
            loading="lazy"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-3 space-y-1">
        {/* Category */}
        {product.category?.categoryName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{product.category?.categoryName}</p>
        )}
        {/* Product Name */}
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white h-10">
          {product.productName}
        </h3>
      </CardContent>
      <CardFooter className="p-3 flex justify-between items-center pt-0">
        {/* Price - Bỏ text-primary, dùng màu đen/trắng */}
        <p className="text-base font-bold text-gray-900 dark:text-white">
            {product.price?.toFixed(0) || '0.00'} VNĐ
        </p>

        {/* Add to Cart Button - Chỉ hiện khi hover Card */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
           <Button
             size="icon"
             variant="outline"
             className={cn(
               "h-8 w-8 rounded-full", // Có thể dùng rounded-full nếu muốn
               "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800", // Style B&W outline
               "text-gray-700 dark:text-gray-300" // Màu icon
             )}
             aria-label="Add to cart"
             // Thêm onClick handler thực tế ở đây nếu cần
             onClick={() => addToCart(product._id)}
           >
             <ShoppingBag className="h-4 w-4" />
           </Button>
        </div>

      </CardFooter>
    </Card>
  );
};

export default Item;