"use client";

import {
  availabilityOptions as defaultAvailabilityOptions,
  categories,
  sizes as defaultSizes,
} from "@/data/productFilterOptions";
import RangeSlider from "react-range-slider-input";

export default function FilterModal({ allProps = {}, products = [], filterOptions = {} }) {
  // Safety check for allProps
  if (!allProps) {
    allProps = {};
  }
  
  // Ensure price exists with default values
  const price = Array.isArray(allProps.price) && allProps.price.length === 2 
    ? allProps.price 
    : [20, 300];
    
  // Ensure other properties exist
    
  const size = typeof allProps.size === 'string' 
    ? allProps.size 
    : "All";
    
  const availability = allProps.availability && allProps.availability.id 
    ? allProps.availability 
    : { id: "all", label: "All", value: null };
    
  const selectedCollections = Array.isArray(allProps.collections) 
    ? allProps.collections 
    : [];

  // Safety function wrappers
  const setPrice = (value) => {
    if (typeof allProps.setPrice === 'function') {
      allProps.setPrice(value);
    }
  };
  

  
  const setSize = (value) => {
    if (typeof allProps.setSize === 'function') {
      allProps.setSize(value);
    }
  };
  
  const setAvailability = (value) => {
    if (typeof allProps.setAvailability === 'function') {
      allProps.setAvailability(value);
    }
  };
  
  const setCollection = (value) => {
    if (typeof allProps.setCollection === 'function') {
      allProps.setCollection(value);
    }
  };
  
  const clearFilter = () => {
    if (typeof allProps.clearFilter === 'function') {
      allProps.clearFilter();
    }
  };
  
  // Use dynamic data from API if available, fall back to static data
    
  const sizes = filterOptions && filterOptions.sizes && Array.isArray(filterOptions.sizes) && filterOptions.sizes.length > 0 
    ? filterOptions.sizes 
    : defaultSizes;
    
  const collectionOptions = filterOptions && filterOptions.collections && Array.isArray(filterOptions.collections) && filterOptions.collections.length > 0 
    ? filterOptions.collections 
    : [];
    
  const availabilityOptions = filterOptions && filterOptions.availabilityOptions && Array.isArray(filterOptions.availabilityOptions) && filterOptions.availabilityOptions.length > 0 
    ? filterOptions.availabilityOptions 
    : defaultAvailabilityOptions;
    
  // Determine the price range for the slider with safety checks
  const minPrice = filterOptions && filterOptions.priceRange && Array.isArray(filterOptions.priceRange) && filterOptions.priceRange.length > 0 
    ? filterOptions.priceRange[0] 
    : 10;
    
  const maxPrice = filterOptions && filterOptions.priceRange && Array.isArray(filterOptions.priceRange) && filterOptions.priceRange.length > 1 
    ? filterOptions.priceRange[1] 
    : 450;

  // Calculate product counts based on the actual products from the API
  const getAvailabilityCount = (option) => {
    return products.filter(el => el.inStock === option.value).length;
  };

  const getCollectionCount = (collection) => {
    return products.filter(el => el.filterCollections && el.filterCollections.includes(collection.id)).length;
  };

  return (
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <div className="canvas-header">
          <h5>Filters</h5>
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="canvas-body">
          <div className="widget-facet facet-categories">
            <h6 className="facet-title">Product Categories</h6>
            <ul className="facet-content">
              {categories.map((category, index) => (
                <li key={index}>
                  <a href="#" className={`categories-item`}>
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="widget-facet facet-price">
            <h6 className="facet-title">Price</h6>

            <RangeSlider
              min={minPrice}
              max={maxPrice}
              value={price}
              onInput={(value) => setPrice(value)}
            />
            <div className="box-price-product mt-3">
              <div className="box-price-item">
                <span className="title-price">Min price</span>
                <div
                  className="price-val"
                  id="price-min-value"
                  data-currency="$"
                >
                  {price[0]}
                </div>
              </div>
              <div className="box-price-item">
                <span className="title-price">Max price</span>
                <div
                  className="price-val"
                  id="price-max-value"
                  data-currency="$"
                >
                  {price[1]}
                </div>
              </div>
            </div>
          </div>
          <div className="widget-facet facet-size">
            <h6 className="facet-title">Size</h6>
            <div className="facet-size-box size-box">
              {sizes.map((sizeOption, index) => (
                <span
                  key={index}
                  onClick={() => setSize(sizeOption)}
                  className={`size-item size-check ${
                    size === sizeOption ? "active" : ""
                  }`}
                >
                  {typeof sizeOption === 'string' ? sizeOption : sizeOption.name || sizeOption}
                </span>
              ))}
              {!sizes.includes("Free Size") && (
                <span
                  className={`size-item size-check free-size ${
                    size == "Free Size" ? "active" : ""
                  } `}
                  onClick={() => setSize("Free Size")}
                >
                  Free Size
                </span>
              )}
            </div>
          </div>

          <div className="widget-facet facet-fieldset">
            <h6 className="facet-title">Availability</h6>
            <div className="box-fieldset-item">
              {availabilityOptions.map((option, index) => (
                <fieldset
                  key={index}
                  className="fieldset-item"
                  onClick={() => setAvailability(option)}
                >
                  <input
                    type="radio"
                    name="availability"
                    className="tf-check"
                    readOnly
                    checked={availability.id === option.id}
                  />
                  <label>
                    {option.label}
                  </label>
                </fieldset>
              ))}
            </div>
          </div>
          <div className="widget-facet facet-fieldset">
            <h6 className="facet-title">Collections</h6>
            <div className="box-fieldset-item">
              {collectionOptions.map((collection, index) => (
                <fieldset
                  key={index}
                  className="fieldset-item"
                  onClick={() => {
                    if (collection && collection.id) {
                      setCollection(collection.id);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    name="collection"
                    className="tf-check"
                    readOnly
                    checked={selectedCollections.includes(collection.id)}
                  />
                  <label>
                    {collection.name}
                  </label>
                </fieldset>
              ))}
            </div>
          </div>
        </div>
        <div className="canvas-bottom">
          <button
            id="reset-filter"
            onClick={clearFilter}
            className="tf-btn btn-reset"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
