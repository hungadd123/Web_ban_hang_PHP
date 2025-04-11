// src/components/ProductsSection.jsx
import React from "react";
import StoreProductItem from "./StoreProductItem"; // Component này cần được nâng cấp sau
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react"; // Icon cho nút Add

const ProductsSection = ({ products, currency, onEdit, onDelete, onCreate }) => {
  return (
    // Dùng Card của Shadcn làm container
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Layout flex cho header */}
        <div className="space-y-1">
            <CardTitle>My Products</CardTitle>
            <CardDescription>Manage your store's inventory.</CardDescription>
        </div>
        {/* Nút Add Product dùng Button của Shadcn */}
        <Button size="sm" onClick={onCreate}>
           <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          // Sửa lại grid columns cho hợp lý hơn
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((prod) => (
              // StoreProductItem nên được refactor để dùng Shadcn Card
              <StoreProductItem
                key={prod._id}
                product={prod}
                currency={currency}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          // Thông báo khi không có sản phẩm
          <div className="flex flex-col items-center justify-center py-12 text-center">
             <h3 className="text-lg font-semibold text-muted-foreground">No products found</h3>
             <p className="text-sm text-muted-foreground mb-4">You haven't added any products yet.</p>
             <Button size="sm" onClick={onCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsSection;