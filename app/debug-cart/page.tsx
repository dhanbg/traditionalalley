"use client";
import { useContextElement } from "@/context/Context";
import { useUser } from "@clerk/nextjs";

export default function DebugCartPage() {
  const { cartProducts, clearCart, clearPurchasedItemsFromCart, totalPrice } = useContextElement();
  const { user } = useUser();

  const handleClearCart = async () => {
    console.log("=== MANUAL CART CLEAR TEST ===");
    console.log("Current cart products:", cartProducts.length);
    console.log("User:", user?.id);
    
    try {
      await clearCart();
      console.log("✅ Manual cart clear completed");
      alert("Cart cleared successfully! Check console for details.");
    } catch (error) {
      console.error("❌ Manual cart clear failed:", error);
      alert("Cart clear failed! Check console for details.");
    }
  };

  const handleClearFirstProduct = async () => {
    console.log("=== MANUAL FIRST PRODUCT CLEAR TEST ===");
    console.log("Current cart products:", cartProducts.length);
    console.log("User:", user?.id);
    
    if (cartProducts.length === 0) {
      alert("No products in cart to clear!");
      return;
    }
    
    try {
      // Clear only the first product as a test
      const firstProduct = cartProducts[0];
      console.log("Clearing first product:", firstProduct.documentId);
      
      await clearPurchasedItemsFromCart([firstProduct]);
      console.log("✅ Manual first product clear completed");
      alert("First product cleared successfully! Check console for details.");
    } catch (error) {
      console.error("❌ Manual first product clear failed:", error);
      alert("First product clear failed! Check console for details.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Cart Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Cart Status</h2>
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Cart Items:</strong> {cartProducts.length}</p>
        <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Cart Items</h2>
        {cartProducts.length > 0 ? (
          <ul>
            {cartProducts.map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{item.title}</strong> - ${item.price} x {item.quantity}
                <br />
                <small>ID: {item.id}, Cart ID: {item.cartId}, Document ID: {item.documentId}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in cart</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleClearCart}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
          disabled={!user}
        >
          Clear All Cart Items
        </button>
        
        <button 
          onClick={handleClearFirstProduct}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          disabled={!user || cartProducts.length === 0}
        >
          Clear First Product Only
        </button>
        
        {!user && <p style={{ color: 'red', marginTop: '10px' }}>Please log in to test cart clearing</p>}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure you're logged in</li>
          <li>Add some items to your cart</li>
          <li>Come back to this page</li>
          <li>Click "Clear Cart" button</li>
          <li>Check the browser console for detailed logs</li>
          <li>Verify that cart is empty after clearing</li>
        </ol>
      </div>
    </div>
  );
} 