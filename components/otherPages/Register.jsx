"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import OTPVerification from "./OTPVerification";

// Password strength validation function
const validatePasswordStrength = (password) => {
  const errors = [];
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    common: !["password", "123456", "123456789", "12345678", "12345", "1234567", "password123", "admin", "qwerty", "abc123", "letmein", "monkey", "password1", "123123", "welcome", "login", "admin123", "iloveyou", "princess", "rockyou", "1234567890", "football", "baseball", "dragon"].includes(password.toLowerCase()),
    sequential: !/123456|abcdef|qwerty/i.test(password),
    repeated: !/(.)\1{2,}/.test(password)
  };

  if (!checks.length) errors.push("Password must be at least 8 characters long");
  if (!checks.lowercase) errors.push("Password must contain at least one lowercase letter");
  if (!checks.uppercase) errors.push("Password must contain at least one uppercase letter");
  if (!checks.number) errors.push("Password must contain at least one number");
  if (!checks.special) errors.push("Password must contain at least one special character");
  if (!checks.common) errors.push("Password is too common. Please choose a more secure password");
  if (!checks.sequential) errors.push("Password cannot contain sequential characters");
  if (!checks.repeated) errors.push("Password cannot contain more than 2 repeated characters in a row");

  const strength = Object.values(checks).filter(Boolean).length;
  return { 
    errors, 
    strength,
    isValid: errors.length === 0,
    checks
  };
};

const PasswordStrengthMeter = ({ password }) => {
  const validation = validatePasswordStrength(password);
  const strengthPercentage = (validation.strength / 8) * 100;
  
  let strengthColor = "#dc3545"; // Red
  let strengthText = "Weak";
  
  if (strengthPercentage >= 75) {
    strengthColor = "#28a745"; // Green
    strengthText = "Strong";
  } else if (strengthPercentage >= 50) {
    strengthColor = "#ffc107"; // Yellow
    strengthText = "Medium";
  }

  return (
    <div className="password-strength-meter mt-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">Password Strength:</small>
        <small style={{ color: strengthColor, fontWeight: "bold" }}>{strengthText}</small>
      </div>
      <div className="progress" style={{ height: "4px" }}>
        <div 
          className="progress-bar" 
          style={{ 
            width: `${strengthPercentage}%`,
            backgroundColor: strengthColor,
            transition: "all 0.3s ease"
          }}
        />
      </div>
      {validation.errors.length > 0 && (
        <div className="password-requirements mt-2">
          <small className="text-muted d-block mb-1">Requirements:</small>
          <ul className="list-unstyled mb-0" style={{ fontSize: "12px" }}>
            {validation.errors.map((error, index) => (
              <li key={index} className="text-danger mb-1">
                <i className="icon-close me-1" style={{ fontSize: "10px" }} />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function Register() {
  const [step, setStep] = useState("register"); // "register" or "verify"
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (password) {
      const validation = validatePasswordStrength(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.target);
    const emailValue = formData.get("email");
    const firstNameValue = formData.get("firstName");
    const lastNameValue = formData.get("lastName");
    const passwordValue = formData.get("password");
    const confirmPasswordValue = formData.get("confirmPassword");

    // Basic validation
    if (!firstNameValue || !lastNameValue || !emailValue || !passwordValue || !confirmPasswordValue) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }
    if (passwordValue !== confirmPasswordValue) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    const validation = validatePasswordStrength(passwordValue);
    if (!validation.isValid) {
      setError("Password does not meet security requirements: " + validation.errors.join(", "));
      setIsLoading(false);
      return;
    }

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 60000); // 60 second timeout
      });

      // Create the fetch promise
      const fetchPromise = fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          firstName: firstNameValue,
          lastName: lastNameValue,
        }),
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send OTP");
        setIsLoading(false);
        return;
      }

      setEmail(emailValue);
      setFirstName(firstNameValue);
      setLastName(lastNameValue);
      setPassword(passwordValue);
      setConfirmPassword(confirmPasswordValue);
      setSuccess("OTP sent successfully! Please check your email.");
      setTimeout(() => {
        setStep("verify");
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Request timeout') {
        setError("Request timed out. Please check your internet connection and try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep("register");
    setError("");
    setSuccess("");
  };

  const handleVerificationSuccess = (user) => {
    setSuccess("Registration completed successfully! Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };
  
  // Show OTP verification step
  if (step === "verify") {
    return (
      <OTPVerification
        email={email}
        firstName={firstName}
        lastName={lastName}
        password={password}
        confirmPassword={confirmPassword}
        onBack={handleBackToRegister}
        onSuccess={handleVerificationSuccess}
      />
    );
  }

  // Show registration step
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="login-wrap">
          <div className="left">
            <div className="heading">
              <h4>Register</h4>
              <p className="text-secondary mb-3">
                Enter your details to get started. We'll send you a verification code.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="form-login"
            >
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
              <div className="wrap">
                <fieldset className="mb-3">
                  <input
                    className=""
                    type="text"
                    placeholder="First Name*"
                    name="firstName"
                    tabIndex={1}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="mb-3">
                  <input
                    className=""
                    type="text"
                    placeholder="Last Name*"
                    name="lastName"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="mb-3">
                  <input
                    className=""
                    type="email"
                    placeholder="Email Address*"
                    name="email"
                    tabIndex={3}
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </fieldset>
                <fieldset className="position-relative password-item mb-3">
                  <input
                    className={`input-password ${!passwordValidation.isValid && password ? 'is-invalid' : ''}`}
                    type={passwordType}
                    placeholder="Password*"
                    name="password"
                    tabIndex={4}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className={`toggle-password ${passwordType !== "text" ? "unshow" : ""}`}
                    onClick={() => setPasswordType(passwordType === "password" ? "text" : "password")}
                  >
                    <i className={`icon-eye-${passwordType !== "text" ? "hide" : "show"}-line`} />
                  </span>
                  {password && <PasswordStrengthMeter password={password} />}
                </fieldset>
                <fieldset className="position-relative password-item mb-3">
                  <input
                    className={`input-password ${!passwordMatch && confirmPassword ? 'is-invalid' : ''}`}
                    type={confirmPasswordType}
                    placeholder="Confirm Password*"
                    name="confirmPassword"
                    tabIndex={5}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className={`toggle-password ${confirmPasswordType !== "text" ? "unshow" : ""}`}
                    onClick={() => setConfirmPasswordType(confirmPasswordType === "password" ? "text" : "password")}
                  >
                    <i className={`icon-eye-${confirmPasswordType !== "text" ? "hide" : "show"}-line`} />
                  </span>
                  {confirmPassword && !passwordMatch && (
                    <div className="invalid-feedback d-block">
                      <small className="text-danger">
                        <i className="icon-close me-1" style={{ fontSize: "10px" }} />
                        Passwords do not match
                      </small>
                    </div>
                  )}
                  {confirmPassword && passwordMatch && password && (
                    <div className="valid-feedback d-block">
                      <small className="text-success">
                        <i className="icon-check me-1" style={{ fontSize: "10px" }} />
                        Passwords match
                      </small>
                    </div>
                  )}
                </fieldset>
                <div className="d-flex align-items-center">
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        defaultChecked
                        className=""
                        type="checkbox"
                        id="login-form_agree"
                        name="agree_checkbox"
                        required
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label
                      className="text-secondary-2"
                      htmlFor="login-form_agree"
                    >
                      I agree to the&nbsp;
                    </label>
                  </div>
                  <Link href={`/term-of-use`} title="Terms of Service">
                    Terms of User
                  </Link>
                </div>
              </div>
              <div className="button-submit">
                <button 
                  className="tf-btn btn-fill" 
                  type="submit"
                  disabled={isLoading || !passwordValidation.isValid || !passwordMatch}
                >
                  <span className="text text-button">
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </span>
                </button>
              </div>
            </form>
          </div>
          <div className="right">
            <h4 className="mb_8">Already have an account?</h4>
            <p className="text-secondary">
              Welcome back. Sign in to access your personalized experience,
              saved preferences, and more. We're thrilled to have you with us
              again!
            </p>
            <Link href={`/login`} className="tf-btn btn-fill">
              <span className="text text-button">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
