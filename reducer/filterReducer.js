import { productWomen } from "@/data/productsWomen";
import { productMen } from "@/data/productsMen"; // Add this import
import { productKids } from "@/data/productsKids"; // Add this import

export const initialState = {
  price: [20, 300],

  availability: "All",

  color: "All",
  size: "All",
  activeFilterOnSale: false,
  brands: [],
  filtered: [...productWomen, ...productMen, ...productKids], // Combine all product data
  sortingOption: "Sort by (Default)",
  sorted: [...productWomen, ...productMen, ...productKids], // Combine all product data
  currentPage: 1,
  itemPerPage: 6,
};

export function reducer(state, action) {
  switch (action.type) {
    case "SET_PRICE":
      return { ...state, price: action.payload };

    case "SET_COLOR":
      return { ...state, color: action.payload };

    case "SET_SIZE":
      return { ...state, size: action.payload };

    case "SET_AVAILABILITY":
      return { ...state, availability: action.payload };

    case "SET_BRANDS":
      return { ...state, brands: action.payload };

    case "SET_FILTERED":
      return { ...state, filtered: [...action.payload] };

    case "SET_SORTING_OPTION":
      return { ...state, sortingOption: action.payload };

    case "SET_SORTED":
      return { ...state, sorted: [...action.payload] };

    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };

    case "TOGGLE_FILTER_ON_SALE":
      return { ...state, activeFilterOnSale: !state.activeFilterOnSale };

    case "SET_ITEM_PER_PAGE":
      return { ...state, itemPerPage: action.payload };

    case "CLEAR_FILTER":
      return {
        ...state,
        price: [20, 300],
        availability: "All",
        color: "All",
        size: "All",
        brands: [],
        activeFilterOnSale: false,
      };

    default:
      return state;
  }
}
