"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { allProducts } from "@/data/productsWomen";
import { useClerk } from "@clerk/nextjs";

export default function Wishlist() {
  const { removeFromWishlist, wishList, user } = useContextElement();
  const { openSignIn } = useClerk();
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    if (user) {
      setItems([...allProducts.filter((elm) => wishList.includes(elm.id))]);
    }
  }, [wishList, user]);
  
  return (
    <div className="modal fullRight fade modal-wishlist" id="wishlist">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <h5 className="title">Wish List</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="tf-minicart-body">
            <div className="tf-minicart-content">
              <div className="tf-modal-minicart">
                {!user ? (
                  <div className="p-4 text-center">
                    <p className="mb-4">Please sign in to view your wishlist.</p>
                    <button 
                      className="btn-style-2 w-100 radius-4"
                      onClick={openSignIn}
                    >
                      <span className="text-btn-uppercase">Sign In</span>
                    </button>
                    <div className="mt-3">
                      <Link
                        href={`/shop-default-grid`}
                        className="text-btn-uppercase"
                      >
                        Or continue shopping
                      </Link>
                    </div>
                  </div>
                ) : items.length ? (
                  <div className="list-group list-product-cart">
                    {items.map((elm, i) => (
                      <div key={i} className="tf-mini-cart-item">
                        <Link
                          href={`/product-detail/${elm.id}`}
                          className="img-product"
                        >
                          <Image
                            alt="img-product"
                            src={elm.imgSrc}
                            width={600}
                            height={800}
                          />
                        </Link>
                        <div className="tf-mini-cart-info flex-grow-1">
                          <div className="mb_12 d-flex align-items-center justify-content-between flex-wrap gap-12">
                            <div className="text-title">
                              <Link
                                href={`/product-detail/${elm.id}`}
                                className="link text-line-clamp-1"
                              >
                                {elm.title}
                              </Link>
                            </div>
                            <div
                              className="text-button tf-btn-remove remove"
                              onClick={() => removeFromWishlist(elm.id)}
                            >
                              Remove
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-12">
                            <div className="text-secondary-2">XL/Blue</div>
                            <div className="text-button">
                              ${elm.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    Your wishlist is empty. Start adding your favorite
                    products to save them for later!{" "}
                    <Link className="btn-line" href="/shop-default-grid">
                      Explore Products
                    </Link>
                  </div>
                )}
              </div>
              {user && (
                <div className="tf-mini-cart-bottom">
                  <Link
                    href={`/wish-list`}
                    className="btn-style-2 w-100 radius-4 view-all-wishlist"
                  >
                    <span className="text-btn-uppercase">View All Wish List</span>
                  </Link>
                  <Link
                    href={`/shop-default-grid`}
                    className="text-btn-uppercase"
                  >
                    Or continue shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
