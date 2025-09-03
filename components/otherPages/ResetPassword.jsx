"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Reset Password
  const [resetToken, setResetToken] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params if available
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully! Now set your new password.");
        setResetToken(data.resetToken);
        setStep(2);
      } else {
        setError(data.error || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! You can now login with your new password.");
        setSuccess(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="login-wrap">
            <div className="left">
              <div className="heading">
                <h4 className="mb_8">Password Reset Successful!</h4>
                <p>Your password has been updated successfully.</p>
              </div>
              
              <div className="alert alert-success" style={{ padding: "20px", backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", borderRadius: "4px", textAlign: "center" }}>
                <h5>✅ Success!</h5>
                <p>{message}</p>
                <p><strong>Redirecting to login page in 3 seconds...</strong></p>
                <div style={{ marginTop: "20px" }}>
                  <Link href="/login" className="tf-btn btn-fill">
                    <span className="text text-button">Go to Login Now</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="right">
              <h4 className="mb_8">Welcome Back!</h4>
              <p className="text-secondary">
                You can now login with your new password and continue shopping with us.
              </p>
              <Link href={`/`} className="tf-btn btn-fill">
                <span className="text text-button">Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">
                {step === 1 ? "Verify OTP" : "Set New Password"}
              </h4>
              <p>
                {step === 1 
                  ? "Enter the OTP sent to your email address" 
                  : "Create a new secure password for your account"
                }
              </p>
            </div>
            
            {/* Step 1: Verify OTP */}
            {step === 1 && (
              <form onSubmit={handleVerifyOTP} className="form-login">
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="email"
                      placeholder="Email address*"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      tabIndex={1}
                      aria-required="true"
                      required
                    />
                  </fieldset>
                </div>
                
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="text"
                      placeholder="Enter 6-digit OTP*"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      tabIndex={2}
                      aria-required="true"
                      required
                      maxLength={6}
                    />
                  </fieldset>
                </div>
                
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: "16px", padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px" }}>
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="alert alert-success" style={{ marginBottom: "16px", padding: "10px", backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", borderRadius: "4px" }}>
                    {message}
                  </div>
                )}
                
                <div className="button-submit">
                  <button 
                    className="tf-btn btn-fill" 
                    type="submit"
                    disabled={loading}
                  >
                    <span className="text text-button">
                      {loading ? "Verifying..." : "Verify OTP"}
                    </span>
                  </button>
                </div>
                
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <Link href="/forget-password" className="link">
                    Resend OTP
                  </Link>
                  {" | "}
                  <Link href="/login" className="link">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="form-login">
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="email"
                      placeholder="Email address"
                      value={email}
                      disabled
                      style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
                    />
                  </fieldset>
                </div>
                
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="password"
                      placeholder="New password*"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      tabIndex={1}
                      aria-required="true"
                      required
                      minLength={6}
                    />
                  </fieldset>
                </div>
                
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="password"
                      placeholder="Confirm new password*"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      tabIndex={2}
                      aria-required="true"
                      required
                      minLength={6}
                    />
                  </fieldset>
                </div>
                
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: "16px", padding: "10px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px" }}>
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="alert alert-success" style={{ marginBottom: "16px", padding: "10px", backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", borderRadius: "4px" }}>
                    {message}
                  </div>
                )}
                
                <div className="button-submit">
                  <button 
                    className="tf-btn btn-fill" 
                    type="submit"
                    disabled={loading}
                  >
                    <span className="text text-button">
                      {loading ? "Resetting..." : "Reset Password"}
                    </span>
                  </button>
                </div>
                
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <button 
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setMessage("");
                      setResetToken("");
                    }}
                    className="link"
                    style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Back to OTP Verification
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="right">
            <h4 className="mb_8">Need Help?</h4>
            <p className="text-secondary">
              {step === 1 
                ? "If you haven't received the OTP, please check your spam folder or try requesting a new one."
                : "Choose a strong password with at least 6 characters for better security."
              }
            </p>
            <Link href={`/contact`} className="tf-btn btn-fill">
              <span className="text text-button">Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 