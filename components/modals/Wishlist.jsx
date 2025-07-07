"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function Wishlist() {
  const { wishList, addProductToCart, removeFromWishlist, user } =
    useContextElement();
  const { data: session } = useSession();

  return (
    <div className="modal fade modal-wishlist" id="wishlist">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Wishlist</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-mini-cart-threshold">
              <div className="tf-progress-bar">
                <span style={{ width: "50%" }}>
                  <div className="progress-car">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13 2.5V4H7V2.5C7 1.67 7.67 1 8.5 1h3C12.33 1 13 1.67 13 2.5zM16 4H14V2.5C14 1.12 12.88 0 11.5 0h-3C7.12 0 6 1.12 6 2.5V4H4C3.45 4 3 4.45 3 5s.45 1 1 1h1v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V6h1c.55 0 1-.45 1-1s-.45-1-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </span>
              </div>
              <div className="tf-progress-msg">
                Buy <span className="price fw-6">$75.00</span> more to enjoy{" "}
                <span className="fw-6">Free Shipping</span>
              </div>
            </div>
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {wishList.map((item) => (
                      <div key={item.id} className="tf-mini-cart-item">
                        <div className="tf-mini-cart-image">
                          <Link href={`/product-detail/${item.id}`}>
                            <Image
                              alt="img"
                              src={item.imgSrc}
                              width={100}
                              height={100}
                            />
                          </Link>
                        </div>
                        <div className="tf-mini-cart-info">
                          <Link
                            className="title link"
                            href={`/product-detail/${item.id}`}
                          >
                            {item.title}
                          </Link>
                          <div className="meta-variant">{item.color}</div>
                          <div className="price fw-6">${item.price}</div>
                        </div>
                        <div className="tf-mini-cart-remove">
                          <a
                            onClick={() => removeFromWishlist(item.id)}
                            className="remove-cart"
                          >
                            <i className="icon-delete" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!wishList.length && (
                    <div className="tf-mini-cart-bottom">
                      <div className="tf-mini-cart-tool">
                        <div className="tf-mini-cart-tool-btn">
                          <Link
                            href={`/shop-default-grid`}
                            className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center fw-6"
                          >
                            Start shopping
                          </Link>
                          <div className="tf-mini-cart-tool-primary text-center fw-6">
                            OR
                          </div>
                          <button
                            className="tf-btn fw-6 btn-line"
                            onClick={() => signIn()}
                          >
                            Login
                            <i className="icon icon-arrow1-top-left" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {wishList.length > 0 && (
                <div className="tf-mini-cart-bottom">
                  <div className="tf-mini-cart-tool">
                    <div className="tf-mini-cart-tool-btn">
                      <Link
                        href={`/wish-list`}
                        className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center fw-6"
                      >
                        View Wishlist
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
