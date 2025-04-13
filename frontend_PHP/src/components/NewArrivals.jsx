import React, { useContext, useEffect, useState, useRef } from "react";
import Title from "./Title";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Navigation } from "swiper/modules";
import Item from "./Item";
import { ShopContext } from "../context/ShopContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NewArrivals = () => {
  const { products } = useContext(ShopContext);
  const [newArrivals, setNewArrivals] = useState([]);
  const swiperRef = useRef(null);
  console.log(products)
  useEffect(() => {
    const data = products.slice(-8);
    setNewArrivals(data);
  }, [products]);

  return (
    <section className="max-padd-container py-16">
      <div className="flex justify-between items-center mb-10">
        <Title
          title1={"New Arrivals"}
          paraStyles={"!block"}
        />
         <div className="flex gap-2">
           <Button
             variant="outline"
             size="icon"
             className="rounded-full"
             onClick={() => swiperRef.current?.swiper.slidePrev()}
           >
             <ChevronLeft className="h-4 w-4" />
             <span className="sr-only">Previous</span>
           </Button>
           <Button
             variant="outline"
             size="icon"
             className="rounded-full"
             onClick={() => swiperRef.current?.swiper.slideNext()}
           >
             <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
           </Button>
         </div>
      </div>

      <Swiper
        ref={swiperRef}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        breakpoints={{
          300: { slidesPerView: 2, spaceBetween: 15 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 30 },
        }}
        modules={[Autoplay, Navigation]}
        className="pb-4"
      >
        {newArrivals.map((product) => (
          <SwiperSlide key={product.id}>
            
            <Item product={product} className="h-full" />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default NewArrivals;