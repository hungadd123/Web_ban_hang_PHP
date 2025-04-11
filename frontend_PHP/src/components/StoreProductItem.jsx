// src/components/StoreProductItem.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"; // Shadcn Card
import { Button } from "@/components/ui/button"; // Shadcn Button
import { FilePenLine, Trash2 } from "lucide-react"; // Shadcn/lucide icons
import { cn } from "@/lib/utils";

const StoreProductItem = ({ product, currency, onEdit, onDelete, className }) => {
  const [hovered, setHovered] = useState(false);

  // --- Loading/Error State ---
  if (!product || !product.image || product.image.length === 0) {
    return <Card className={cn("overflow-hidden group animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg", className)}></Card>; // Tăng chiều cao một chút cho phù hợp
  }

  return (
    // Sử dụng Card và các hiệu ứng hover tương tự Item.jsx
    <Card
      className={cn(
        "overflow-hidden group border border-transparent rounded-lg flex flex-col", // Thêm flex flex-col để footer luôn ở dưới
        "hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700",
        "hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
        "transition-all duration-300 ease-in-out",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <Link
          to={`/product/${product._id}`}
          className="aspect-square block overflow-hidden rounded-t-lg" // Giữ tỷ lệ vuông
        >
          <img
            src={
              product.image.length > 1 && hovered
                ? product.image[1]
                : product.image[0]
            }
            alt={product.name || "Product Image"}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </CardHeader>
      {/* Phần content chiếm không gian còn lại */}
      <CardContent className="p-3 space-y-1 flex-grow">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
        )}
        <h3 className="text-sm font-semibold line-clamp-2 text-foreground h-10">
          {product.name}
        </h3>
        {/* Có thể thêm mô tả ngắn nếu cần */}
        {/* <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p> */}
      </CardContent>
      {/* Footer chứa giá và các nút action */}
      <CardFooter className="p-3 flex justify-between items-center border-t border-border pt-3"> {/* Thêm border-t */}
        {/* Price */}
        <p className="text-base font-bold text-gray-900 dark:text-white">
           {currency || '$'}{product.price?.toFixed(2) || '0.00'}
        </p>

        {/* Edit & Delete Buttons */}
        <div className="flex gap-x-1.5">
          <Button
            variant="outline"
            size="icon" // Dùng size icon cho gọn
            className="h-8 w-8 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            onClick={() => onEdit(product)}
            aria-label="Edit product"
          >
            <FilePenLine className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
          <Button
            variant="ghost" // Dùng ghost để bớt nổi bật, kết hợp màu destructive
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10" // Màu chữ destructive, hover nền nhẹ
            onClick={() => onDelete(product._id)}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoreProductItem;