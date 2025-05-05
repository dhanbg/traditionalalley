import React from "react";

export default function FilterMeta({ allProps = {}, productLength = 0 }) {
  // Add safety check
  if (!allProps) {
    return null;
  }
  
  // Extract and provide safe defaults for filter properties
  const availability = allProps.availability || { id: "all", label: "All", value: null };
  const size = allProps.size || "All";
  const color = allProps.color || { name: "All", className: "" };
  const collections = Array.isArray(allProps.collections) ? allProps.collections : [];
  const collectionObjects = Array.isArray(allProps.filterOptions?.collections) 
    ? allProps.filterOptions.collections 
    : [];
  
  // Safely wrap callbacks
  const setAvailability = (val) => {
    if (typeof allProps.setAvailability === 'function') {
      allProps.setAvailability(val);
    }
  };
  
  const setSize = (val) => {
    if (typeof allProps.setSize === 'function') {
      allProps.setSize(val);
    }
  };
  
  const setColor = (val) => {
    if (typeof allProps.setColor === 'function') {
      allProps.setColor(val);
    }
  };
  
  const removeCollection = (val) => {
    if (typeof allProps.removeCollection === 'function') {
      allProps.removeCollection(val);
    }
  };
  
  const clearFilter = () => {
    if (typeof allProps.clearFilter === 'function') {
      allProps.clearFilter();
    }
  };

  // Helper function to get collection name from ID
  const getCollectionName = (collectionId) => {
    const collection = collectionObjects.find(c => c.id === collectionId);
    return collection ? collection.name : collectionId;
  };
  
  return (
    <div className="meta-filter-shop" style={{}}>
      <div id="product-count-grid" className="count-text">
        <span className="count">{productLength}</span> Products Found
      </div>

      <div id="applied-filters">
        {availability && availability.id !== "all" ? (
          <span
            className="filter-tag"
            onClick={() => setAvailability({ id: "all", label: "All", value: null })}
          >
            {availability.label}
            <span className="remove-tag icon-close" />
          </span>
        ) : (
          ""
        )}
        {size !== "All" ? (
          <span 
            className="filter-tag" 
            onClick={() => setSize("All")}
          >
            {size}
            <span className="remove-tag icon-close" />
          </span>
        ) : (
          ""
        )}
        {color && color.name !== "All" ? (
          <span
            className="filter-tag color-tag"
            onClick={() => setColor({ name: "All", className: "", imgSrc: null })}
          >
            {color.imgSrc ? (
              <span 
                className="color color-image" 
                style={{ 
                  backgroundImage: `url(${color.imgSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            ) : (
              <span className={`color ${color.className || ""}`} />
            )}
            {color.name}
            <span className="remove-tag icon-close" />
          </span>
        ) : (
          ""
        )}

        {collections && collections.length ? (
          <React.Fragment>
            {collections.map((collectionId, i) => (
              <span
                key={i}
                className="filter-tag"
                onClick={() => removeCollection(collectionId)}
              >
                {getCollectionName(collectionId)}
                <span className="remove-tag icon-close" />
              </span>
            ))}
          </React.Fragment>
        ) : (
          ""
        )}
      </div>
      {(availability && availability.id !== "all") ||
      size !== "All" ||
      (color && color.name !== "All") ||
      (collections && collections.length) ? (
        <button
          id="remove-all"
          className="remove-all-filters text-btn-uppercase"
          onClick={clearFilter}
        >
          REMOVE ALL <i className="icon icon-close" />
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
