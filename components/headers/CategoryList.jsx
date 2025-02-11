import React from "react";

const categories = [
  {
    name: "Boss Lady",
    subcategories: ["Waist Coat & Pant", "Coat", "Pants"],
  },
  {
    name: "Juvenile",
    subcategories: ["Pink Printed", "Black Printed Set"],
  },
  {
    name: "Events",
    subcategories: ["Sarees"],
  },
  {
    name: "Gown",
    subcategories: ["Princess", "Belk"],
  },
  {
    name: "Kurtha",
    subcategories: ["Rose Velvet Kurtha", "Gleamy Pastels", "Glory Pastels"],
  },
];

export default function CategoryList() {
  return (
    <div className="list-categories-inner">
      <ul>
        {categories.map((category, index) => (
          <li className="sub-categories2" key={index}>
            <a href="#" className="categories-item">
              <span className="inner-left">{category.name}</span>
              <i className="icon icon-arrRight" />
            </a>
            <ul className="list-categories-inner">
              {category.subcategories.map((subcategory, subIndex) => (
                <li key={subIndex}>
                  <a href="#" className="categories-item">
                    <span className="inner-left">{subcategory}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
