'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export default function CouponDemo() {
  const { data: session } = useSession();
  const [couponCode, setCouponCode] = useState('');
  const [orderAmount, setOrderAmount] = useState(100);
  const [validationResult, setValidationResult] = useState(null);
  const [applicationResult, setApplicationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: orderAmount
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setValidationResult(data.coupon);
        setError('');
      } else {
        setError(data.error?.message || data.error || data.message || 'Invalid coupon code');
        setValidationResult(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setError('Failed to validate coupon. Please try again.');
      setValidationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!validationResult) {
      setError('Please validate the coupon first');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationResult(null);

    try {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponId: validationResult.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApplicationResult(data);
        setError('');
        // Reset validation to force re-validation
        setValidationResult(null);
      } else {
        setError(data.error?.message || data.error || data.message || 'Failed to apply coupon');
        setApplicationResult(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('Failed to apply coupon. Please try again.');
      setApplicationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setCouponCode('');
    setValidationResult(null);
    setApplicationResult(null);
    setError('');
  };

  if (!session) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <h2>Coupon System Demo</h2>
            <p className="mb-4">Please sign in to test the coupon system.</p>
            <Link href="/sign-in" className="tf-btn">
              <span className="text">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="text-center mb-5">
            <h1>Coupon System Demo</h1>
            <p className="lead">Test the new coupon system with usage limits and once-per-user options</p>
          </div>

          {/* Demo Instructions */}
          <div className="row mb-5">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary">📊 Usage Limit Coupons</h5>
                  <p className="card-text">
                    These coupons have a global usage limit. Once the limit is reached, 
                    no one can use the coupon anymore.
                  </p>
                  <ul className="list-unstyled">
                    <li>✓ Global usage tracking</li>
                    <li>✓ Multiple users can use the same coupon</li>
                    <li>✓ Stops working when limit is reached</li>
                  </ul>
                  <div className="alert alert-info">
                    <strong>Test Code:</strong> SAVE10 (if available)
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title text-success">👤 Once Per User Coupons</h5>
                  <p className="card-text">
                    These coupons can only be used once per user. Each user gets 
                    one chance to use the coupon.
                  </p>
                  <ul className="list-unstyled">
                    <li>✓ Per-user usage tracking</li>
                    <li>✓ Each user can use it once</li>
                    <li>✓ No global usage limit</li>
                  </ul>
                  <div className="alert alert-success">
                    <strong>Test Code:</strong> WELCOMETA (if available)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Testing Interface */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Test Coupon Validation & Application</h5>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code (e.g., SAVE10, WELCOMETA)"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Order Amount ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(Number(e.target.value))}
                    min="1"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mb-3">
                <button
                  className="tf-btn"
                  onClick={validateCoupon}
                  disabled={loading || !couponCode.trim()}
                >
                  <span className="text">
                    {loading ? 'Validating...' : 'Validate Coupon'}
                  </span>
                </button>
                
                {validationResult && (
                  <button
                    className="tf-btn"
                    onClick={applyCoupon}
                    disabled={loading}
                    style={{ backgroundColor: '#28a745' }}
                  >
                    <span className="text">
                      {loading ? 'Applying...' : 'Apply Coupon'}
                    </span>
                  </button>
                )}
                
                <button
                  className="tf-btn"
                  onClick={resetDemo}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  <span className="text">Reset</span>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Validation Result */}
              {validationResult && (
                <div className="alert alert-success">
                  <h6>✅ Coupon Validation Successful!</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Code:</strong> {validationResult.code}<br/>
                      <strong>Description:</strong> {validationResult.description}<br/>
                      <strong>Type:</strong> {validationResult.discountType}<br/>
                    </div>
                    <div className="col-md-6">
                      <strong>Value:</strong> {validationResult.discountType === 'percentage' ? `${validationResult.discountValue}%` : `$${validationResult.discountValue}`}<br/>
                      <strong>Discount Amount:</strong> ${validationResult.discountAmount}<br/>
                      <strong>Final Total:</strong> ${(orderAmount - validationResult.discountAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Application Result */}
              {applicationResult && (
                <div className="alert alert-info">
                  <h6>🎉 Coupon Applied Successfully!</h6>
                  <p>The coupon has been marked as used. Try validating it again to see the difference!</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-4 text-center">
            <small className="text-muted">
              Logged in as: <strong>{session.user.email}</strong> (ID: {session.user.id})
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}