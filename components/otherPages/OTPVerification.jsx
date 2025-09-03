"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";

export default function OTPVerification({ email, firstName, lastName, password, confirmPassword, onBack, onSuccess }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && otp.every(d => d !== "") && !isLoading) {
      handleVerifyOtp({ preventDefault: () => {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setSuccess("OTP resent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setError(data.error + ": " + data.details.join(", "));
        } else {
          setError(data.error || "Verification failed");
        }
        return;
      }

      setSuccess("Registration completed successfully! Redirecting to login...");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          router.push("/login");
        }
      }, 2000);
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>Verify Your Email</h4>
              <p className="text-secondary mb-3">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="form-login">
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success mb-3" role="alert">
                  {success}
                </div>
              )}

              {/* OTP Input */}
              <div className="wrap mb-4">
                <label className="form-label">Enter Verification Code</label>
                <div className="otp-inputs d-flex justify-content-between mb-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="otp-input text-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "20px",
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        margin: "0 5px",
                      }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      maxLength={1}
                    />
                  ))}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary">
                    {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : "Code expired"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={handleResendOtp}
                    disabled={!canResend || resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              </div>

              <div className="button-submit">
                <button
                  className="tf-btn btn-fill mb-3"
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="text text-button">
                    {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                  </span>
                </button>
                
                <button
                  type="button"
                  className="tf-btn btn-outline"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  <span className="text text-button">Back to Registration</span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="right">
            <h4 className="mb_8">Secure Registration</h4>
            <p className="text-secondary mb-3">
              We've sent a 6-digit verification code to your email address. Please check your inbox and enter the code to complete your registration.
            </p>
            <p className="text-secondary mt-3">
              <strong>Didn't receive the code?</strong><br />
              Check your spam folder or click "Resend Code" to receive a new one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}