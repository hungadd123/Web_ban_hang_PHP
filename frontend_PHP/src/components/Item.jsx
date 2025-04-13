import React, { useState, useContext } from "react"; // Thêm useContext
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopContext } from "../context/ShopContext"; // Import context
import { formatCurrency } from "../utils/helpers"; // Import helper nếu cần format price ở đây

const Item = ({ product, className }) => {
    const [hovered, setHovered] = useState(false);
    const { addToCart, currency } = useContext(ShopContext); // Lấy hàm addToCart và currency từ context

    // Kiểm tra product và mảng images có tồn tại và có phần tử không
    if (!product || !product.images || product.images.length === 0) {
        // Render skeleton hoặc null
        return (
            <Card className={cn("overflow-hidden group animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-lg", className)}>
            </Card>
        );
    }

    // Luôn lấy ảnh đầu tiên (thumbnail) từ mảng images
    const displayImage = product.images[0];

    const handleAddToCart = (e) => {
        e.preventDefault(); // Ngăn link điều hướng khi nhấn nút add to cart
        e.stopPropagation(); // Ngăn các sự kiện khác (như hover) bị ảnh hưởng
        addToCart(product.id); // Gọi hàm addToCart từ context với ID đúng
    }

    return (
        <Card
            className={cn(
                "overflow-hidden group border border-transparent rounded-lg flex flex-col", // Thêm flex flex-col để footer đẩy xuống dưới
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
                    to={`/product/${product.id}`} // Dùng product.id
                    className="aspect-square block overflow-hidden rounded-t-lg"
                >
                    <img
                        src={displayImage} // Luôn hiển thị ảnh đầu tiên
                        alt={product.productName || "Product Image"} // Dùng productName
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                    />
                </Link>
            </CardHeader>
            <CardContent className="p-3 space-y-1 flex-grow"> {/* Thêm flex-grow */}
                {product.category?.categoryName && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category.categoryName}</p>
                )}
                <Link to={`/product/${product.id}`} className="block hover:text-primary">
                    <h3 className="text-sm font-semibold line-clamp-2 text-foreground h-10">
                        {product.productName}
                    </h3>
                 </Link>
            </CardContent>
            <CardFooter className="p-3 flex justify-between items-center pt-2 border-t dark:border-border"> {/* Thêm border-t và pt-2 */}
                <p className="text-base font-bold text-foreground">
                     {formatCurrency(product.price, currency || 'VND', 'vi-VN')} {/* Sử dụng helper format */}
                </p>
                <div className={`transition-opacity duration-300 ease-in-out ${hovered ? 'opacity-100' : 'opacity-0'}`}> {/* Hiện/ẩn dựa trên hover Card */}
                    <Button
                        size="icon"
                        variant="outline"
                        className={cn( "h-8 w-8 rounded-full", "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800", "text-gray-700 dark:text-gray-300" )}
                        aria-label="Add to cart"
                        onClick={handleAddToCart} // Gọi hàm xử lý add to cart
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default Item;