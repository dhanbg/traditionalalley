"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { checkWelcomeCouponUsage, getWelcomeCouponForAutoSelection } from '@/utils/productVariantUtils';

export default function TestWelcomeCoupon() {
  const { data: session } = useSession();
  const [couponStatus, setCouponStatus] = useState(null);
  const [autoSelectionData, setAutoSelectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  const checkCouponStatus = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Check if user has used the coupon
      const status = await checkWelcomeCouponUsage(userId);
      setCouponStatus(status);
      
      // Get auto-selection data
      const autoData = await getWelcomeCouponForAutoSelection(userId);
      setAutoSelectionData(autoData);
      
    } catch (error) {
      console.error('Error checking coupon status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      setTestUserId(session.user.id);
      checkCouponStatus(session.user.id);
    }
  }, [session]);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>WELCOMETOTA Coupon Test</h3>
            </div>
            <div className="card-body">
              {!session ? (
                <div className="alert alert-warning">
                  Please log in to test the coupon functionality.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h5>Current User</h5>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>ID:</strong> {session.user.id}</p>
                  </div>

                  <div className="mb-4">
                    <h5>Test with Different User ID</h5>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter user ID or email"
                        value={testUserId}
                        onChange={(e) => setTestUserId(e.target.value)}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => checkCouponStatus(testUserId)}
                        disabled={loading || !testUserId.trim()}
                      >
                        {loading ? 'Checking...' : 'Check Status'}
                      </button>
                    </div>
                  </div>

                  {couponStatus && (
                    <div className="mb-4">
                      <h5>Coupon Usage Status</h5>
                      <div className={`alert ${couponStatus.hasUsed ? 'alert-warning' : 'alert-success'}`}>
                        <p><strong>Has Used WELCOMETOTA:</strong> {couponStatus.hasUsed ? 'Yes' : 'No'}</p>
                        <p><strong>Coupon Active:</strong> {couponStatus.isActive ? 'Yes' : 'No'}</p>
                        <p><strong>Coupon Valid:</strong> {couponStatus.isValid ? 'Yes' : 'No'}</p>
                        {couponStatus.error && (
                          <p><strong>Error:</strong> {couponStatus.error}</p>
                        )}
                      </div>
                      
                      {couponStatus.couponData && (
                        <div className="mt-3">
                          <h6>Coupon Details</h6>
                          <ul>
                            <li><strong>Code:</strong> {couponStatus.couponData.code}</li>
                            <li><strong>Description:</strong> {couponStatus.couponData.description}</li>
                            <li><strong>Discount Type:</strong> {couponStatus.couponData.discountType}</li>
                            <li><strong>Discount Value:</strong> {couponStatus.couponData.discountValue}</li>
                            <li><strong>Minimum Order:</strong> ${couponStatus.couponData.minimumOrderAmount || 0}</li>
                            <li><strong>Maximum Discount:</strong> ${couponStatus.couponData.maximumDiscountAmount || 'No limit'}</li>
                            <li><strong>Used Count:</strong> {couponStatus.couponData.usedCount}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {autoSelectionData && (
                    <div className="mb-4">
                      <h5>Auto-Selection Data</h5>
                      <div className="alert alert-info">
                        <p><strong>✅ This user is eligible for auto-selection!</strong></p>
                        <p><strong>Code:</strong> {autoSelectionData.code}</p>
                        <p><strong>Description:</strong> {autoSelectionData.description}</p>
                        <p><strong>Discount:</strong> {autoSelectionData.discountType === 'percentage' 
                          ? `${autoSelectionData.discountValue}%` 
                          : `$${autoSelectionData.discountValue}`}
                        </p>
                        <p><strong>Auto Selected:</strong> {autoSelectionData.autoSelected ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}

                  {couponStatus && !autoSelectionData && (
                    <div className="mb-4">
                      <h5>Auto-Selection Data</h5>
                      <div className="alert alert-secondary">
                        <p><strong>❌ This user is NOT eligible for auto-selection</strong></p>
                        <p>Reason: {couponStatus.hasUsed ? 'User has already used this coupon' : 'Coupon is not valid or active'}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h5>How it works in Checkout</h5>
                    <div className="alert alert-light">
                      <ol>
                        <li>When a logged-in user visits the checkout page, the system automatically checks if they have used the WELCOMETOTA coupon.</li>
                        <li>If they haven't used it and the coupon is valid, it gets automatically applied to their order.</li>
                        <li>The user sees a special message indicating it's a welcome discount and can remove it if they prefer to use a different coupon.</li>
                        <li>If they have already used it, no auto-selection occurs and they see the normal coupon interface.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a href="/checkout" className="btn btn-success me-2">Test in Checkout</a>
                    <a href="/coupon-demo" className="btn btn-info">Coupon Demo Page</a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}