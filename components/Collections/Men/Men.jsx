import React from "react";
import Hero from '@/components/homes/MenHero'
import Collections from "./Collections";
import CategoryFaq from "../Common/CategoryFaq";

const Men = () => {
  return (
    <>
      <Hero />
      <Collections />
      <CategoryFaq type="men" />
    </>
  );
};

export default Men;
