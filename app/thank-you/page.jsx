"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Topbar6 from "@/components/headers/Topbar6";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from URL parameters
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const paymentMethod = searchParams.get('paymentMethod');
    
    if (orderId) {
      setOrderDetails({
        orderId,
        amount: amount ? parseFloat(amount) : null,
        paymentMethod: paymentMethod || 'cod'
      });
    }
  }, [searchParams]);

  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '48px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Thank You Message */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Thank You for Your Purchase!
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Your order has been successfully placed. We appreciate your business and trust in Traditional Alley.
            </p>

            {/* Order Details */}
            {orderDetails && (
              <div style={{
                background: '#f8fafc',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Order Details
                </h3>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* Order ID removed as requested */}
                  
                  {orderDetails.amount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>Total Amount:</span>
                      <span style={{ fontWeight: '600', color: '#059669', fontSize: '18px' }}>
                        NPR {orderDetails.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Payment Method:</span>
                    <span style={{
                      background: orderDetails.paymentMethod === 'cod' ? '#fef3c7' : '#dbeafe',
                      color: orderDetails.paymentMethod === 'cod' ? '#92400e' : '#1e40af',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {orderDetails.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                    </span>
                  </div>
                </div>
              </div>
            )}



            {/* Next Steps */}
            <div style={{
              background: '#eff6ff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #3b82f6',
              marginBottom: '32px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>📋</span>
                What's Next?
              </h4>
              <ul style={{
                color: '#1e40af',
                margin: '0',
                paddingLeft: '20px',
                fontSize: '14px',
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                <li>You will receive an order confirmation email or call shortly</li>
                <li>We will process your order and prepare it for shipping</li>
                <li>You'll get tracking information once your order is dispatched</li>
                <li>Our delivery partner will contact you before delivery</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/"
                className="tf-btn btn-fill animate-hover-btn radius-3"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  minWidth: '160px'
                }}
              >
                Continue Shopping
              </Link>
              
              <Link 
                href="/my-account-orders"
                className="tf-btn btn-outline animate-hover-btn radius-3"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  minWidth: '160px'
                }}
              >
                View My Orders
              </Link>
            </div>

            {/* Contact Support */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
                Need help? Contact our support team at{' '}
                <a href="mailto:support@traditionalalley.com" style={{ color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                  support@traditionalalley.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      
      {/* Page Title */}
      <div
        className="page-title"
        style={{ 
          backgroundImage: "url(/images/section/page-title.jpg)",
          height: "200px",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3 className="heading text-center">Order Confirmation</h3>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link className="link" href="/">
                    Homepage
                  </Link>
                </li>
                <li>
                  <i className="icon-arrRight" />
                </li>
                <li>
                  <span>Thank You</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Content */}
      <section className="flat-spacing-11">
        <Suspense fallback={
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <div>Loading...</div>
          </div>
        }>
          <ThankYouContent />
        </Suspense>
      </section>

      <Footer1 />
    </>
  );
}