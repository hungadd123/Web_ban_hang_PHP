import React from "react";
import StoreProductItem from "./StoreProductItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const ProductsSection = ({ products, currency, onEdit, onDelete, onCreate }) => {
    console.log("Products received in ProductsSection render:", products);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage your store's inventory.</CardDescription>
                </div>
                <Button size="sm" onClick={onCreate}>
                   <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </CardHeader>
            <CardContent>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {products.map((prod, index) => {
                             const keyToUse = prod.id ?? prod._id;
                             const productUrl = `/product/${prod.id}`;
                             console.log(`Mapping product index ${index}, ID: ${prod.id}, _ID: ${prod._id}, Generated Key: ${keyToUse}, URL: ${productUrl}`);
                             if (keyToUse === undefined || keyToUse === null) {
                                 console.error(`MISSING KEY for product at index ${index}:`, prod);
                             }
                             return (
                                 <StoreProductItem
                                     key={keyToUse ?? `fallback-key-${index}-${Math.random()}`}
                                     product={prod}
                                     productUrl={productUrl}
                                     currency={currency}
                                     onEdit={onEdit}
                                     onDelete={onDelete}
                                 />
                             );
                        })}
                    </div>
                ) : (
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