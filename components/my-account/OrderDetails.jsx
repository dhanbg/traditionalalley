"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { fetchDataFromApi, getImageUrl, getOptimizedImageUrl } from "@/utils/api";

export default function OrderDetails() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [activeTab, setActiveTab] = useState(2); // Start with Item Details tab
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data with user_bag populated
        const userDataResponse = await fetchDataFromApi(
          `/api/user-datas?filters[clerkUserId][$eq]=${user.id}&populate=user_bag`
        );

        if (userDataResponse?.data && userDataResponse.data.length > 0) {
          const userData = userDataResponse.data[0];
          const userBag = userData.user_bag;

          if (userBag && userBag.user_orders && userBag.user_orders.payments) {
            // Find the specific order
            const order = userBag.user_orders.payments.find(
              payment => payment.merchantTxnId === orderId || payment.processId === orderId
            );

            if (order && order.status === "Success") {
              setOrderData(order);
              
              // Fetch product details for each product in the order
              if (order.orderData?.products) {
                const productPromises = order.orderData.products.map(async (product) => {
                  try {
                    const productResponse = await fetchDataFromApi(
                      `/api/products?filters[documentId][$eq]=${product.documentId}&populate=*`
                    );
                    return {
                      ...product,
                      details: productResponse?.data?.[0] || null
                    };
                  } catch (error) {
                    console.error(`Error fetching product ${product.documentId}:`, error);
                    return { ...product, details: null };
                  }
                });

                const productsWithDetails = await Promise.all(productPromises);
                setProductDetails(productsWithDetails);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderNumber = () => {
    if (!orderData) return "N/A";
    return orderData.merchantTxnId?.split('-').pop() || 
           orderData.processId?.split('_').pop() || 
           "Unknown";
  };

  const getFirstProductImage = () => {
    const firstProduct = productDetails[0];
    if (firstProduct?.details?.imgSrc) {
      return getOptimizedImageUrl(firstProduct.details.imgSrc);
    }
    return "/images/products/default-product.jpg";
  };

  const getFirstProductName = () => {
    const firstProduct = productDetails[0];
    return firstProduct?.details?.title || "Product";
  };

  if (loading) {
    return (
      <div className="my-account-content">
        <div className="account-order-details">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="my-account-content">
        <div className="account-order-details">
          <div className="text-center">
            <h4>Order not found</h4>
            <p>The requested order could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-order-details">
        <div className="wd-form-order">
          <div className="order-head">
            <figure className="img-product" style={{ width: '80px', height: '100px', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
              <Image
                alt="product"
                src={getFirstProductImage()}
                width={80}
                height={100}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </figure>
            <div className="content">
              <div className="badge">Success</div>
              <h6 className="mt-8 fw-5">Order #{getOrderNumber()}</h6>
            </div>
          </div>
          <div className="tf-grid-layout md-col-2 gap-15">
            <div className="item">
              <div className="text-2 text_black-2">Items</div>
              <div className="text-2 mt_4 fw-6">{productDetails.length} Product{productDetails.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Payment Method</div>
              <div className="text-2 mt_4 fw-6">{orderData.provider?.toUpperCase() || 'Online Payment'}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Order Date</div>
              <div className="text-2 mt_4 fw-6">
                {formatDate(orderData.timestamp)}
              </div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">Delivery Address</div>
              <div className="text-2 mt_4 fw-6">
                {orderData.orderData?.receiver_details?.address ? 
                  `${orderData.orderData.receiver_details.address.street}, ${orderData.orderData.receiver_details.address.city}` :
                  'Address not available'
                }
              </div>
            </div>
          </div>
          <div className="widget-tabs style-3 widget-order-tab">
            <ul className="widget-menu-tab">
              <li
                className={`item-title ${activeTab == 1 ? "active" : ""} `}
                onClick={() => setActiveTab(1)}
              >
                <span className="inner">Order History</span>
              </li>
              <li
                className={`item-title ${activeTab == 2 ? "active" : ""} `}
                onClick={() => setActiveTab(2)}
              >
                <span className="inner">Item Details</span>
              </li>
              <li
                className={`item-title ${activeTab == 3 ? "active" : ""} `}
                onClick={() => setActiveTab(3)}
              >
                <span className="inner">Courier</span>
              </li>
              <li
                className={`item-title ${activeTab == 4 ? "active" : ""} `}
                onClick={() => setActiveTab(4)}
              >
                <span className="inner">Receiver</span>
              </li>
            </ul>
            <div className="widget-content-tab">
              <div
                className={`widget-content-inner ${
                  activeTab == 1 ? "active" : ""
                } `}
              >
                <div className="widget-timeline">
                  <ul className="timeline">
                    <li>
                      <div className="timeline-badge success" />
                      <div className="timeline-box">
                        <a className="timeline-panel" href="#">
                          <div className="text-2 fw-6">Product Shipped</div>
                          <span>10/07/2024 4:30pm</span>
                        </a>
                        <p>
                          <strong>Courier Service : </strong>FedEx World Service
                          Center
                        </p>
                        <p>
                          <strong>Estimated Delivery Date : </strong>12/07/2024
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="timeline-badge success" />
                      <div className="timeline-box">
                        <a className="timeline-panel" href="#">
                          <div className="text-2 fw-6">Product Shipped</div>
                          <span>10/07/2024 4:30pm</span>
                        </a>
                        <p>
                          <strong>Tracking Number : </strong>2307-3215-6759
                        </p>
                        <p>
                          <strong>Warehouse : </strong>T-Shirt 10b
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="timeline-badge" />
                      <div className="timeline-box">
                        <a className="timeline-panel" href="#">
                          <div className="text-2 fw-6">Product Packaging</div>
                          <span>12/07/2024 4:34pm</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <div className="timeline-badge" />
                      <div className="timeline-box">
                        <a className="timeline-panel" href="#">
                          <div className="text-2 fw-6">Order Placed</div>
                          <span>11/07/2024 2:36pm</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className={`widget-content-inner ${
                  activeTab == 2 ? "active" : ""
                } `}
              >
                {productDetails.map((product, index) => (
                  <div key={index} className={`order-head ${index > 0 ? 'mt-20' : ''}`}>
                                         <figure className="img-product" style={{ width: '80px', height: '100px', border: '1px solid var(--line)', borderRadius: '3px', overflow: 'hidden' }}>
                       <Image
                         alt="product"
                         src={product.details?.imgSrc ? getOptimizedImageUrl(product.details.imgSrc) : "/images/products/default-product.jpg"}
                         width={80}
                         height={100}
                         style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                       />
                     </figure>
                    <div className="content">
                                             <div className="text-2 fw-6">{product.details?.title || 'Product Name'}</div>
                      <div className="mt_4">
                        <span className="fw-6">Price :</span> ${product.unitPrice}
                      </div>
                      <div className="mt_4">
                        <span className="fw-6">Size :</span> {product.size}
                      </div>
                      <div className="mt_4">
                        <span className="fw-6">Color :</span> {product.color}
                      </div>
                      <div className="mt_4">
                        <span className="fw-6">Quantity :</span> {product.quantity}
                      </div>
                    </div>
                  </div>
                ))}
                
                <ul className="mt-20">
                  <li className="d-flex justify-content-between text-2">
                    <span>Subtotal</span>
                    <span className="fw-6">${orderData.orderData?.products?.reduce((sum, p) => sum + p.subtotal, 0) || 0}</span>
                  </li>
                  <li className="d-flex justify-content-between text-2 mt_4">
                    <span>Shipping</span>
                    <span className="fw-6">${orderData.orderData?.shippingPrice || 0}</span>
                  </li>
                  <li className="d-flex justify-content-between text-2 mt_4 pb_8 line-bt">
                    <span>Total Discounts</span>
                    <span className="fw-6">${orderData.orderData?.products?.reduce((sum, p) => sum + (p.discount || 0), 0) || 0}</span>
                  </li>
                  <li className="d-flex justify-content-between text-2 mt_8">
                    <span>Order Total</span>
                    <span className="fw-6">${orderData.amount}</span>
                  </li>
                </ul>
              </div>
              <div
                className={`widget-content-inner ${
                  activeTab == 3 ? "active" : ""
                } `}
              >
                <p>
                  Our courier service is dedicated to providing fast, reliable,
                  and secure delivery solutions tailored to meet your needs.
                  Whether you're sending documents, parcels, or larger
                  shipments, our team ensures that your items are handled with
                  the utmost care and delivered on time. With a commitment to
                  customer satisfaction, real-time tracking, and a wide network
                  of routes, we make it easy for you to send and receive
                  packages both locally and internationally. Choose our service
                  for a seamless and efficient delivery experience.
                </p>
              </div>
              <div
                className={`widget-content-inner ${
                  activeTab == 4 ? "active" : ""
                } `}
              >
                <p className="text-2 text-success">
                  Thank you! Your order has been received
                </p>
                <ul className="mt_20">
                  <li>
                    Order Number : <span className="fw-7">#{getOrderNumber()}</span>
                  </li>
                  <li>
                    Date :<span className="fw-7"> {formatDate(orderData.timestamp)}</span>
                  </li>
                  <li>
                    Total : <span className="fw-7">${orderData.amount}</span>
                  </li>
                  <li>
                    Payment Method :
                    <span className="fw-7"> {orderData.provider?.toUpperCase() || 'Online Payment'}</span>
                  </li>
                  {orderData.orderData?.receiver_details && (
                    <>
                      <li className="mt_12">
                        <strong>Receiver Details:</strong>
                      </li>
                      <li>
                        Name: <span className="fw-7">
                          {orderData.orderData.receiver_details.firstName} {orderData.orderData.receiver_details.lastName}
                        </span>
                      </li>
                      <li>
                        Email: <span className="fw-7">{orderData.orderData.receiver_details.email}</span>
                      </li>
                      <li>
                        Phone: <span className="fw-7">{orderData.orderData.receiver_details.phone}</span>
                      </li>
                      {orderData.orderData.receiver_details.address && (
                        <>
                          <li>
                            Address: <span className="fw-7">
                              {orderData.orderData.receiver_details.address.street}, {orderData.orderData.receiver_details.address.city}, {orderData.orderData.receiver_details.address.state} {orderData.orderData.receiver_details.address.postalCode}, {orderData.orderData.receiver_details.address.country}
                            </span>
                          </li>
                        </>
                      )}
                      {orderData.orderData.receiver_details.note && (
                        <li>
                          Note: <span className="fw-7">{orderData.orderData.receiver_details.note}</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
