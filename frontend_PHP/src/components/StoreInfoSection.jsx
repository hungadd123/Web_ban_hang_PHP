// src/components/StoreInfoSection.jsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react"; // Icon cho nút Save

const StoreInfoSection = ({ storeName, setStoreName, storeAddress, setStoreAddress, updateStoreInfo }) => {
  return (
    // Dùng Card của Shadcn làm container
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
        <CardDescription>Update your store's name and address.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Dùng form với các component Input, Label của Shadcn */}
        <form onSubmit={updateStoreInfo} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter store name"
              required // Thêm required nếu cần
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input
              id="storeAddress"
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="Enter store address"
              required // Thêm required nếu cần
            />
          </div>
          {/* Nút bấm dùng Button của Shadcn */}
          <Button type="submit" className="w-full sm:w-auto"> {/* width full trên mobile */}
             <Save className="mr-2 h-4 w-4" /> Update Store Info
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreInfoSection;