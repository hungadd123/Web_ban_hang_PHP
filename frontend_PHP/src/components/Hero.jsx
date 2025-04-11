import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import clothingBanner from "../assets/banner.jpg"; // Bỏ hoặc thay thế bằng ảnh banner quần áo của bạn
// Ví dụ: import clothingBanner from "../assets/clothing-banner.jpg";

const Hero = () => {
  return (
    <section className="max-padd-container py-12 md:py-20">
      <div className="relative bg-slate-300 border border-gray-200 dark:border-gray-800 p-8 md:p-16 lg:p-20 rounded-3xl">
        <div className="flex flex-col items-start max-w-2xl z-10 relative"> {/* Thêm z-10 relative để text nổi lên trên ảnh (nếu có) */}

          {/* Tiêu đề phụ - Thay đổi nội dung và màu sắc */}
          <p className="text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
             {/* Ví dụ: NEW SEASON // SPRING/SUMMER '25 (Dùng ngày hiện tại 2025) */}
             SPRING/SUMMER '25
          </p>

          {/* Tiêu đề chính - Thay đổi nội dung */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {/* Ví dụ: New Season Styles Arrived // Explore Your Unique Style */}
            New Season Styles Arrived
          </h1>

          {/* Mô tả - Thay đổi nội dung */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
            {/* Ví dụ: Discover our latest collection... */}
            Discover our latest collection of streetwear, essentials, and statement pieces. Update your wardrobe today.
          </p>

          {/* Button - Style đen trắng */}
          <Button size="lg" className="group bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Shop Collection
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        {/* --- PHẦN THÊM ẢNH BANNER QUẦN ÁO --- */}
        {/*
         1. Import ảnh của bạn ở đầu file (ví dụ: import clothingBanner from "../assets/clothing-banner.jpg";)
         2. Bỏ comment phần img dưới đây và thay src={clothingBanner}
         3. Điều chỉnh className để ảnh hiển thị đẹp mắt (ví dụ: vị trí, kích thước, độ trong suốt)
        */}
        
        <img
          src={clothingBanner} // <-- Thay thế bằng biến ảnh bạn đã import
          alt="Featured Clothing Styles" // <-- Thay đổi alt text
          // Điều chỉnh các class này cho phù hợp với ảnh và thiết kế của bạn
          className="absolute top-0 right-0 h-full w-1/2 object-cover opacity-80 lg:opacity-100 rounded-r-3xl hidden md:block pointer-events-none"
        />
       

      </div>
    </section>
  );
};

export default Hero;