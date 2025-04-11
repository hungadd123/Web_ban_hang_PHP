import React, { useContext, useEffect, useState } from "react";
import Title from "./Title";
import Item from "./Item";
import { ShopContext } from "../context/ShopContext";

const PopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const { products } = useContext(ShopContext);

  useEffect(() => {
    const data = products.filter(item => item.popular);
    setPopularProducts(data.slice(0, 8));
  }, [products]);

  return (
    <section className="max-padd-container py-16">
      <Title
        title1={"Popular"}
        title2={"Products"}
        titleStyles={"pb-10 md:pb-14"}
        paraStyles={"!block"}
      />
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {popularProducts.map((product) => (
          <Item key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default PopularProducts;