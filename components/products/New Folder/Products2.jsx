"use client";

import { useEffect, useReducer, useState } from "react";
import FilterModal from "./FilterModal";
import { initialState, reducer } from "@/reducer/filterReducer";
import { productMain } from "@/data/productsWomen";
import FilterMeta from "./FilterMeta";
import ProductCard7 from "../productCards/ProductCard7";
import Pagination from "../common/Pagination";

export default function Products2() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    price,
    availability,
    color,
    size,
    brands,
    filtered,
    sortingOption,
    sorted,
    activeFilterOnSale,
    currentPage,
    itemPerPage,
  } = state;

  const totalPages = Math.ceil(sorted.length / itemPerPage);

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
    setColor: (value) => {
      value === color
        ? dispatch({ type: "SET_COLOR", payload: "All" })
        : dispatch({ type: "SET_COLOR", payload: value });
    },
    setSize: (value) => {
      value === size
        ? dispatch({ type: "SET_SIZE", payload: "All" })
        : dispatch({ type: "SET_SIZE", payload: value });
    },
    setAvailability: (value) => {
      value === availability
        ? dispatch({ type: "SET_AVAILABILITY", payload: "All" })
        : dispatch({ type: "SET_AVAILABILITY", payload: value });
    },
    setBrands: (newBrand) => {
      const updated = [...brands].includes(newBrand)
        ? [...brands].filter((elm) => elm !== newBrand)
        : [...brands, newBrand];
      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    removeBrand: (newBrand) => {
      const updated = [...brands].filter((brand) => brand !== newBrand);
      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    toggleFilterWithOnSale: () => dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
      dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
    clearFilter: () => {
      dispatch({ type: "CLEAR_FILTER" });
    },
  };

  useEffect(() => {
    let filteredArrays = [];

    if (brands.length) {
      const filteredByBrands = productMain.filter((elm) =>
        brands.every((el) => elm.filterBrands.includes(el))
      );
      filteredArrays.push(filteredByBrands);
    }
    if (availability !== "All") {
      const filteredByAvailability = productMain.filter(
        (elm) => availability.value === elm.inStock
      );
      filteredArrays.push(filteredByAvailability);
    }
    if (color !== "All") {
      const filteredByColor = productMain.filter((elm) =>
        elm.filterColor.includes(color.name)
      );
      filteredArrays.push(filteredByColor);
    }
    if (size !== "All" && size !== "Free Size") {
      const filteredBySize = productMain.filter((elm) =>
        elm.filterSizes.includes(size)
      );
      filteredArrays.push(filteredBySize);
    }
    if (activeFilterOnSale) {
      const filteredByOnSale = productMain.filter((elm) => elm.oldPrice);
      filteredArrays.push(filteredByOnSale);
    }

    const filteredByPrice = productMain.filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays.push(filteredByPrice);

    const commonItems = productMain.filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, availability, color, size, brands, activeFilterOnSale]);

  useEffect(() => {
    let sortedItems = filtered;
    if (sortingOption === "Price Ascending") {
      sortedItems = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortingOption === "Price Descending") {
      sortedItems = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortingOption === "Title Ascending") {
      sortedItems = [...filtered].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    } else if (sortingOption === "Title Descending") {
      sortedItems = [...filtered].sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }
    dispatch({ type: "SET_SORTED", payload: sortedItems });
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="tf-shop-control">
          <div className="tf-control-filter">
            <a
              href="#filterShop"
              data-bs-toggle="offcanvas"
              aria-controls="filterShop"
              className="tf-btn-filter"
            >
              <span className="icon icon-filter" />
              <span className="text">Filters</span>
            </a>
            <div
              onClick={allProps.toggleFilterWithOnSale}
              className={`d-none d-lg-flex shop-sale-text ${
                activeFilterOnSale ? "active" : ""
              }`}
            >
              <i className="icon icon-checkCircle" />
              <p className="text-caption-1">Shop sale items only</p>
            </div>
          </div>
        </div>

        {/* Adjusted Grid Layout */}
        <div className="wrapper-control-shop">
          <div className="tf-grid-layout wrapper-shop">
            <div className="row">
              {sorted
                .slice(
                  (currentPage - 1) * 8,
                  currentPage * 8
                )
                .map((product, index) => (
                  <div
                    className="col-6 col-lg-3 mb-4" // 2x4 grid on large screens, 2x2 grid on small screens
                    key={index}
                  >
                    <ProductCard7 product={product} gridClass="grid" />
                  </div>
                ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={(value) =>
                dispatch({ type: "SET_CURRENT_PAGE", payload: value })
              }
            />
          </div>
        </div>
      </div>
      <FilterModal allProps={allProps} />
    </section>
  );
}
