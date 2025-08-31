"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
// import Topbar from "@/components/headers/Topbar";
import BannerCountdown from "@/components/homes/BannerCountdown";
import Blogs from "@/components/homes/Blogs";
import Collections from "@/components/homes/Categories";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/Hero";
import Products from "@/components/common/Products3";
import ShopGram from "@/components/common/ShopGram";
import Testimonials3 from "@/components/common/Testimonials3";
import MarqueeSection from "@/components/common/MarqueeSection";
import CustomizationPopup from "@/components/common/CustomizationPopup";

function PaymentMessageHandler() {
  const searchParams = useSearchParams();
  const [paymentMessage, setPaymentMessage] = useState(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment) {
      switch (payment) {
        case 'success':
          setPaymentMessage({
            type: 'success',
            title: '🎉 Payment Successful!',
            message: 'Your order has been processed successfully. Thank you for shopping with Traditional Alley!'
          });
          break;
        case 'failed':
          setPaymentMessage({
            type: 'error',
            title: '❌ Payment Failed',
            message: 'Your payment could not be processed. Please try again or contact support.'
          });
          break;
        case 'pending':
          setPaymentMessage({
            type: 'warning',
            title: '⏳ Payment Pending',
            message: 'Your payment is being processed. We will notify you once it is confirmed.'
          });
          break;
        case 'error':
          setPaymentMessage({
            type: 'error',
            title: '⚠️ Payment Error',
            message: 'An error occurred while processing your payment. Please try again.'
          });
          break;
      }
      
      // Auto-hide message after 10 seconds
      const timer = setTimeout(() => {
        setPaymentMessage(null);
        // Remove payment parameter from URL
        const url = new URL(window.location);
        url.searchParams.delete('payment');
        window.history.replaceState({}, '', url);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    paymentMessage && (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: paymentMessage.type === 'success' ? '#d4edda' : 
                        paymentMessage.type === 'warning' ? '#fff3cd' : '#f8d7da',
        color: paymentMessage.type === 'success' ? '#155724' : 
               paymentMessage.type === 'warning' ? '#856404' : '#721c24',
        border: `1px solid ${paymentMessage.type === 'success' ? '#c3e6cb' : 
                             paymentMessage.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`,
        borderRadius: '8px',
        padding: '15px 20px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.5s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {paymentMessage.title}
            </h4>
            <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
              {paymentMessage.message}
            </p>
          </div>
          <button
            onClick={() => setPaymentMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '15px',
              color: 'inherit',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
      </div>
    )
  );
}

export default function Home() {
  return (
    <>
      {/* Customization Popup */}
      <CustomizationPopup />
      
      {/* Payment Status Message */}
      <Suspense fallback={<div style={{display: 'none'}}>Loading payment status...</div>}>
        <PaymentMessageHandler />
      </Suspense>
      
      {/* <Topbar /> */}
      <Header1 />
      <MarqueeSection />
      <Hero />
      {/* <Collections /> */}
      {/* <Products /> */}
      {/* <BannerCollection /> */}
      <div style={{ marginTop: '60px' }}>
        {console.log('📍 About to render BannerCountdown component')}
        <BannerCountdown />
      </div>
      {/* <Testimonials3 /> */}
      <ShopGram />
      {/* <Features /> */}
      {/* <Blogs /> */}
      <Footer1 hasPaddingBottom />
      
      {/* CSS for animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
