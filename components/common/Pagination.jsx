"use client";
import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      listStyle: "none",
      padding: 0,
      marginTop: "20px",
    },
    item: {
      padding: "8px 16px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#ddd",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#333",
      transition: "all 0.3s ease",
      userSelect: "none",
    },
    active: {
      backgroundColor: "#181818",
      color: "#fff",
      borderColor: "#181818",
    },
    disabled: {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  };

  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return (
        <li
          key={page}
          style={{
            ...styles.item,
            ...(page === currentPage ? styles.active : {}),
          }}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </li>
      );
    });
  };

  return (
    <ul style={styles.container}>
      <li
        style={{
          ...styles.item,
          ...(currentPage === 1 ? styles.disabled : {}),
        }}
        onClick={() => handlePageClick(currentPage - 1)}
      >
        <i className="icon-arrLeft" /> Previous
      </li>
      {renderPageNumbers()}
      <li
        style={{
          ...styles.item,
          ...(currentPage === totalPages ? styles.disabled : {}),
        }}
        onClick={() => handlePageClick(currentPage + 1)}
      >
        Next <i className="icon-arrRight" />
      </li>
    </ul>
  );
}
