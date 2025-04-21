"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";
import { useContextElement } from "@/context/Context";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";

const discounts = [
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
  {
    discount: "10% OFF",
    details: "For all orders from 200$",
    code: "Mo234231",
  },
];
const shippingOptions = [
  // {
  //   id: "free",
  //   label: "Free Shipping",
  //   price: 0.0,
  // },
  {
    id: "local",
    label: "Local:",
    price: 15.0,
  },
  {
    id: "rate",
    label: "International:",
    price: 35.0,
  },
];

export default function ShopCart() {
  const [activeDiscountIndex, setActiveDiscountIndex] = useState(1);
  const [selectedOption, setSelectedOption] = useState(shippingOptions[0]);
  const {
    cartProducts,
    setCartProducts,
    updateQuantity,
    removeFromCart,
    totalPrice
  } = useContextElement();
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  
  useEffect(() => {
    const initialColors = {};
    const initialSizes = {};
    
    cartProducts.forEach(product => {
      if (product.colors && product.colors.length > 0) {
        const colorName = typeof product.colors[0] === 'string' 
          ? product.colors[0] 
          : (product.colors[0].name || '');
        initialColors[product.id] = colorName;
      }
      
      if (product.sizes && product.sizes.length > 0) {
        initialSizes[product.id] = product.sizes[0];
      }
    });
    
    setSelectedColors(initialColors);
    setSelectedSizes(initialSizes);
  }, [cartProducts]);
  
  const handleColorChange = (productId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };
  
  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const setQuantity = (id, quantity) => {
    // Don't allow quantities less than 1
    if (quantity < 1) return;
    
    // Use the updateQuantity function from Context
    // This will update both frontend state and backend
    updateQuantity(id, quantity);
  };
  
  const removeItem = (id, cartDocumentId) => {
    console.log(`ShopCart: Removing item with ID: ${id}, cartDocumentId: ${cartDocumentId}`);
    
    // Instead of just updating the state, use the removeFromCart function
    // which handles both frontend state and backend deletion
    removeFromCart(id, cartDocumentId);
  };
  
  const handleOptionChange = (elm) => {
    setSelectedOption(elm);
  };

  // useEffect(() => {
  //   document.querySelector(".progress-cart .value").style.width = "70%";
  // }, []);

  return (
    <>
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-xl-8">
              {/* <div className="tf-cart-sold">
                <div className="notification-sold bg-surface">
                  <Image
                    className="icon"
                    alt="img"
                    src="/images/logo/icon-fire.png"
                    width={48}
                    height={49}
                  />
                  <div className="count-text">
                    Your cart will expire in
                    <div
                      className="js-countdown time-count"
                      data-timer={600}
                      data-labels=":,:,:,"
                    >
                      <CountdownTimer
                        style={4}
                        targetDate={new Date(new Date().getTime() - 30 * 60000)}
                      />
                    </div>
                    minutes! Please checkout now before your items sell out!
                  </div>
                </div>
                <div className="notification-progress">
                  <div className="text">
                    Buy
                    <span className="fw-semibold text-primary">
                      $70.00
                    </span>{" "}
                    more to get <span className="fw-semibold">Freeship</span>
                  </div>
                  <div className="progress-cart">
                    <div
                      className="value"
                      style={{ width: "0%" }}
                      data-progress={50}
                    >
                      <span className="round" />
                    </div>
                  </div>
                </div>
              </div> */}
              {cartProducts.length ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  <table className="tf-table-page-cart">
                    <thead>
                      <tr>
                        <th>Products</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cartProducts.map((elm, i) => (
                        <tr key={i} className="tf-cart-item file-delete">
                          <td className="tf-cart-item_product">
                            <Link
                              href={`/product-detail/${elm.documentId}`}
                              className="img-box"
                            >
                              <Image
                                alt="product"
                                src={elm.imgSrc}
                                width={600}
                                height={800}
                              />
                            </Link>
                            <div className="cart-info">
                              <Link
                                href={`/product-detail/${elm.documentId}`}
                                className="cart-title link"
                              >
                                {elm.title}
                              </Link>
                              <div className="variant-box">
                                {elm.colors && elm.colors.length > 0 && (
                                  <div className="tf-select">
                                    <select
                                      value={selectedColors[elm.id] || ''}
                                      onChange={(e) => handleColorChange(elm.id, e.target.value)}
                                    >
                                      {elm.colors.map((color, index) => {
                                        const colorName = typeof color === 'string' 
                                          ? color 
                                          : (color.name || '');
                                        return (
                                          <option key={index} value={colorName}>
                                            {colorName}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                )}
                                
                                {elm.sizes && elm.sizes.length > 0 && (
                                  <div className="tf-select">
                                    <select
                                      value={selectedSizes[elm.id] || ''}
                                      onChange={(e) => handleSizeChange(elm.id, e.target.value)}
                                    >
                                      {elm.sizes.map((size, index) => (
                                        <option key={index} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            data-cart-title="Price"
                            className="tf-cart-item_price text-center"
                          >
                            <div className="cart-price text-button price-on-sale">
                              ${elm.price.toFixed(2)}
                            </div>
                          </td>
                          <td
                            data-cart-title="Quantity"
                            className="tf-cart-item_quantity"
                          >
                            <div className="wg-quantity mx-md-auto">
                              <span
                                className="btn-quantity btn-decrease"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity - 1)
                                }
                              >
                                -
                              </span>
                              <input
                                type="text"
                                className="quantity-product"
                                name="number"
                                value={elm.quantity}
                                readOnly
                              />
                              <span
                                className="btn-quantity btn-increase"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1)
                                }
                              >
                                +
                              </span>
                            </div>
                          </td>
                          <td
                            data-cart-title="Total"
                            className="tf-cart-item_total text-center"
                          >
                            <div className="cart-total text-button total-price">
                              ${(elm.price * elm.quantity).toFixed(2)}
                            </div>
                          </td>
                          <td
                            data-cart-title="Remove"
                            className="remove-cart"
                            onClick={() => removeItem(elm.id, elm.cartDocumentId)}
                          >
                            <span className="remove icon icon-close" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="ip-discount-code">
                    <input type="text" placeholder="Add voucher discount" />
                    <button className="tf-btn">
                      <span className="text">Apply Code</span>
                    </button>
                  </div>
                  <div className="group-discount">
                    {discounts.map((item, index) => (
                      <div
                        key={index}
                        className={`box-discount ${
                          activeDiscountIndex === index ? "active" : ""
                        }`}
                        onClick={() => setActiveDiscountIndex(index)}
                      >
                        <div className="discount-top">
                          <div className="discount-off">
                            <div className="text-caption-1">Discount</div>
                            <span className="sale-off text-btn-uppercase">
                              {item.discount}
                            </span>
                          </div>
                          <div className="discount-from">
                            <p className="text-caption-1">{item.details}</p>
                          </div>
                        </div>
                        <div className="discount-bot">
                          <span className="text-btn-uppercase">
                            {item.code}
                          </span>
                          <button className="tf-btn">
                            <span className="text">Apply Code</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              ) : (
                <div>
                  Your wishlist is empty. Start adding your favorite products to
                  save them for later!{" "}
                  <Link className="btn-line" href="/shop-default-grid">
                    Explore Products
                  </Link>
                </div>
              )}
            </div>
            <div className="col-xl-4">
              <div className="fl-sidebar-cart">
                <div className="box-order bg-surface">
                  <h5 className="title">Order Summary</h5>
                  <div className="subtotal text-button d-flex justify-content-between align-items-center">
                    <span>Subtotal</span>
                    <span className="total">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="discount text-button d-flex justify-content-between align-items-center">
                    <span>Discounts</span>
                    <span className="total">${totalPrice ? "20" : 0}</span>
                  </div>
                  <div className="ship">
                    <span className="text-button">Shipping</span>
                    <div className="flex-grow-1">
                      {shippingOptions.map((option) => (
                        <fieldset key={option.id} className="ship-item">
                          <input
                            type="radio"
                            name="ship-check"
                            className="tf-check-rounded"
                            id={option.id}
                            checked={selectedOption === option}
                            onChange={() => handleOptionChange(option)}
                          />
                          <label htmlFor={option.id}>
                            <span>{option.label}</span>
                            <span className="price">
                              ${option.price.toFixed(2)}
                            </span>
                          </label>
                        </fieldset>
                      ))}
                    </div>
                  </div>
                  <h5 className="total-order d-flex justify-content-between align-items-center">
                    <span>Total</span>
                    <span className="total">
                      $
                      {totalPrice
                        ? (selectedOption.price + totalPrice).toFixed(2)
                        : 0}
                    </span>
                  </h5>
                  <div className="box-progress-checkout">
                    <fieldset className="check-agree">
                      <input
                        type="checkbox"
                        id="check-agree"
                        className="tf-check-rounded"
                      />
                      <label htmlFor="check-agree">
                        I agree with the
                        <Link href={`/term-of-use`}>terms and conditions</Link>
                      </label>
                    </fieldset>
                    <Link href={`/checkout`} className="tf-btn btn-reset">
                      Process To Checkout
                    </Link>
                    <p className="text-button text-center">
                      Or continue shopping
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
