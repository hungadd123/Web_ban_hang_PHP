import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const StoreProductItem = ({ product, currency, onEdit, onDelete, className, productUrl }) => {
    const [hovered, setHovered] = useState(false);

    if (!product || !product.images || product.images.length === 0) {
        return <Card className={cn("overflow-hidden group animate-pulse bg-gray-200 dark:bg-gray-800 h-96 rounded-lg", className)}></Card>;
    }

    const urlToLink = productUrl || `/product/${product.id}`;

    return (
        <Card
            className={cn(
                "overflow-hidden group border border-transparent rounded-lg flex flex-col",
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
                    to={urlToLink}
                    onClick={() => console.log(`Link clicked for product ID: ${product.id}, URL: ${urlToLink}`)}
                    className="aspect-square block overflow-hidden rounded-t-lg"
                >
                    <img
                        src={
                            product.images.length > 1 && hovered
                                ? product.images[1]
                                : product.images[0]
                        }
                        alt={product.productName || "Product Image"}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                    />
                </Link>
            </CardHeader>
            <CardContent className="p-3 space-y-1 flex-grow">
                {product.category_id && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide"></p>
                )}
                <h3 className="text-sm font-semibold line-clamp-2 text-foreground h-10">
                    {product.productName}
                </h3>
            </CardContent>
            <CardFooter className="p-3 flex justify-between items-center border-t border-border pt-3">
                <p className="text-base font-bold text-gray-900 dark:text-white">
                   {currency || '₫'}{product.price?.toLocaleString('vi-VN') || '0'} VND
                </p>
                <div className="flex gap-x-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        onClick={() => onEdit(product)}
                        aria-label="Edit product"
                    >
                        <FilePenLine className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(product.id)}
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