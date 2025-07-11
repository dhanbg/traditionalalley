export const initialState = {
  price: [20, 300],
  availability: { id: "all", label: "All", value: null },
  color: { name: "All", className: "", imgSrc: null },
  size: "All",
  activeFilterOnSale: false,
  collections: [],
  filtered: [], // Will be populated from API
  sortingOption: "Sort by (Default)",
  sorted: [], // Will be populated from API
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

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };

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
        availability: { id: "all", label: "All", value: null },
        color: { name: "All", className: "", imgSrc: null },
        size: "All",
        collections: [],
        activeFilterOnSale: false,
      };

    default:
      return state;
  }
}
