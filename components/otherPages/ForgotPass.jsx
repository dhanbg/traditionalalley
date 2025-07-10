"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Set new password
  const [resetToken, setResetToken] = useState("");
  
  // Refs for OTP inputs
  const otpRefs = useRef([]);

  useEffect(() => {
    // Focus first OTP input when step changes to 2
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/send-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Check your email for the 6-digit OTP code.");
        setStep(2);
      } else {
        setError(data.error || "Failed to send reset OTP");
      }
    } catch (error) {
      console.error("Error sending reset OTP:", error);
      setError("Failed to send reset OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus the last filled input or the first empty one
    const lastFilledIndex = pastedData.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
      otpRefs.current[lastFilledIndex + 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
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
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully! Now set your new password.");
        setResetToken(data.resetToken);
        setStep(3);
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
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/login";
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

  const otpBoxStyles = {
    width: '50px',
    height: '50px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e1e5e9',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '600',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    outline: 'none',
    margin: '0 6px'
  };

  const otpBoxFocusStyles = {
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)',
    backgroundColor: '#f8f9fa'
  };

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4 className="mb_8">
                {step === 1 && "Reset your password"}
                {step === 2 && "Check your email"}
                {step === 3 && "Set new password"}
              </h4>
              <p>
                {step === 1 && "We will send you an OTP to reset your password"}
                {step === 2 && "Enter the 6-digit OTP sent to your email"}
                {step === 3 && "Create a new secure password for your account"}
              </p>
            </div>
            
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="form-login">
                <div className="wrap">
                  <fieldset className="">
                    <input
                      className=""
                      type="email"
                      placeholder="Enter your email address*"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      tabIndex={1}
                      aria-required="true"
                      required
                    />
                  </fieldset>
                </div>
                
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#fee", color: "#c33", border: "1px solid #fcc", borderRadius: "8px", fontSize: "14px" }}>
                    <strong>⚠️ Error:</strong> {error}
                  </div>
                )}
                
                <div className="button-submit">
                  <button 
                    className="tf-btn btn-fill" 
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#6c757d' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 123, 255, 0.3)',
                      transition: 'all 0.2s ease',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                      }
                    }}
                  >
                    <span className="text text-button">
                      {loading ? "Sending..." : "Send Reset OTP"}
                    </span>
                  </button>
                </div>
                
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <Link href="/login" className="link" style={{ color: "#6c757d", textDecoration: "none" }}>
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {step === 2 && (
              <div>
                {message && (
                  <div className="alert alert-success" style={{ 
                    marginBottom: "24px", 
                    padding: "20px", 
                    backgroundColor: "#d4edda", 
                    color: "#155724", 
                    border: "1px solid #c3e6cb", 
                    borderRadius: "12px", 
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    <h5 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
                      📧 Check your email
                    </h5>
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                      We've sent a 6-digit code to
                    </p>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#0d4f0d" }}>
                      {email}
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleVerifyOTP} className="form-login">
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "12px", 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: "#495057",
                      textAlign: "center"
                    }}>
                      Enter verification code
                    </label>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px"
                    }}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => otpRefs.current[index] = el}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          maxLength={1}
                          style={{
                            ...otpBoxStyles,
                            ...(document.activeElement === otpRefs.current[index] ? otpBoxFocusStyles : {})
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#007bff';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                            e.target.style.backgroundColor = '#f8f9fa';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e1e5e9';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#fff';
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ 
                      textAlign: "center", 
                      fontSize: "12px", 
                      color: "#6c757d", 
                      margin: 0 
                    }}>
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" style={{ 
                      marginBottom: "16px", 
                      padding: "12px 16px", 
                      backgroundColor: "#fee", 
                      color: "#c33", 
                      border: "1px solid #fcc", 
                      borderRadius: "8px", 
                      fontSize: "14px",
                      textAlign: "center"
                    }}>
                      <strong>⚠️ Error:</strong> {error}
                    </div>
                  )}
                  
                  <div className="button-submit">
                    <button 
                      className="tf-btn btn-fill" 
                      type="submit"
                      disabled={loading || otp.join('').length !== 6}
                      style={{
                        background: loading || otp.join('').length !== 6 ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: loading || otp.join('').length !== 6 ? 'none' : '0 4px 12px rgba(40, 167, 69, 0.3)',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      <span className="text text-button">
                        {loading ? "Verifying..." : "Verify Code"}
                      </span>
                    </button>
                  </div>
                  
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button 
                      onClick={() => {
                        setStep(1);
                        setError("");
                        setMessage("");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="link"
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#6c757d", 
                        textDecoration: "none", 
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ← Use different email
                    </button>
                    <span style={{ margin: "0 12px", color: "#dee2e6" }}>|</span>
                    <button 
                      onClick={handleSendOTP}
                      className="link"
                      disabled={loading}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#007bff", 
                        textDecoration: "none", 
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      🔄 Resend code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Set New Password */}
            {step === 3 && (
              <div>
                {message && (
                  <div className="alert alert-success" style={{ 
                    marginBottom: "24px", 
                    padding: "20px", 
                    backgroundColor: "#d4edda", 
                    color: "#155724", 
                    border: "1px solid #c3e6cb", 
                    borderRadius: "12px", 
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    <h5 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
                      ✅ Verification successful!
                    </h5>
                    <p style={{ margin: 0, fontSize: "14px" }}>
                      Now create your new secure password
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleResetPassword} className="form-login">
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
                        style={{
                          borderRadius: "8px",
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: "#e1e5e9",
                          padding: "12px 16px",
                          fontSize: "16px"
                        }}
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
                        style={{
                          borderRadius: "8px",
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: "#e1e5e9",
                          padding: "12px 16px",
                          fontSize: "16px"
                        }}
                      />
                    </fieldset>
                  </div>
                  
                  <div style={{ 
                    marginBottom: "16px", 
                    padding: "12px", 
                    backgroundColor: "#f8f9fa", 
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#6c757d"
                  }}>
                    <strong>Password requirements:</strong>
                    <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                      <li>At least 6 characters long</li>
                      <li>Include letters and numbers for better security</li>
                    </ul>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" style={{ 
                      marginBottom: "16px", 
                      padding: "12px 16px", 
                      backgroundColor: "#fee", 
                      color: "#c33", 
                      border: "1px solid #fcc", 
                      borderRadius: "8px", 
                      fontSize: "14px" 
                    }}>
                      <strong>⚠️ Error:</strong> {error}
                    </div>
                  )}
                  
                  <div className="button-submit">
                    <button 
                      className="tf-btn btn-fill" 
                      type="submit"
                      disabled={loading}
                      style={{
                        background: loading ? '#6c757d' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(220, 53, 69, 0.3)',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      <span className="text text-button">
                        {loading ? "Resetting..." : "🔒 Reset Password"}
                      </span>
                    </button>
                  </div>
                  
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button 
                      onClick={() => {
                        setStep(2);
                        setError("");
                        setMessage("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setResetToken("");
                      }}
                      className="link"
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#6c757d", 
                        textDecoration: "none", 
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ← Back to verification
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="right">
            <h4 className="mb_8">
              {step === 1 && "New Customer"}
              {step === 2 && "Security First"}
              {step === 3 && "Almost Done!"}
            </h4>
            <p className="text-secondary">
              {step === 1 && "Be part of our growing family of new customers! Join us today and unlock a world of exclusive benefits, offers, and personalized experiences."}
              {step === 2 && "We've sent a secure verification code to your email. This helps us ensure that only you can reset your password."}
              {step === 3 && "Choose a strong password with at least 6 characters. Consider using a mix of letters, numbers, and symbols for better security."}
            </p>
            <Link href={step === 1 ? `/register` : step === 2 ? `/contact` : `/`} className="tf-btn btn-fill">
              <span className="text text-button">
                {step === 1 && "Register"}
                {step === 2 && "🆘 Need Help?"}
                {step === 3 && "🛍️ Continue Shopping"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
