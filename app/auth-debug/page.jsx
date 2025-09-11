"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut, getProviders } from "next-auth/react";
import Link from "next/link";

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [userManagementStatus, setUserManagementStatus] = useState(null);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [envVars, setEnvVars] = useState({
    nextauthUrl: '',
    hasGoogleClientId: false,
    hasGoogleClientSecret: false,
    hasNextauthSecret: false,
    googleClientIdPrefix: ''
  });
  const [isClient, setIsClient] = useState(false);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { message, type, timestamp }]);
  };

  useEffect(() => {
    setIsClient(true);
    
    // Fetch environment configuration from API
    const fetchEnvConfig = async () => {
      try {
        const response = await fetch('/api/auth-config');
        const config = await response.json();
        setEnvVars(config);
        addLog("Environment configuration loaded", "success");
      } catch (error) {
        addLog(`Error loading environment config: ${error.message}`, "error");
      }
    };
    
    const fetchProviders = async () => {
      try {
        const res = await getProviders();
        setProviders(res);
        addLog("Providers fetched successfully", "success");
      } catch (error) {
        addLog(`Error fetching providers: ${error.message}`, "error");
      }
    };
    
    fetchEnvConfig();
    fetchProviders();
  }, []);

  useEffect(() => {
    addLog(`Session status: ${status}`, "info");
    if (session) {
      addLog(`User authenticated: ${session.user?.email}`, "success");
      addLog(`User ID: ${session.user?.id}`, "info");
      addLog(`Session expires: ${session.expires}`, "info");
    }
  }, [session, status]);

  const testGoogleSignIn = async () => {
    setIsTestingAuth(true);
    addLog("Starting Google OAuth test...", "info");
    
    try {
      // Use redirect: true for actual Google OAuth flow
      await signIn("google", { 
        callbackUrl: "/auth-debug"
      });
      
      addLog("Redirecting to Google for authentication...", "success");
    } catch (error) {
      addLog(`Sign-in exception: ${error.message}`, "error");
      setIsTestingAuth(false);
    }
  };

  const testUserManagement = async () => {
    if (!session) {
      addLog("No session available for user management test", "error");
      return;
    }

    addLog("Testing user-management API...", "info");
    setUserManagementStatus("testing");

    try {
      const response = await fetch('/api/user-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        addLog(`User management success: ${JSON.stringify(result)}`, "success");
        setUserManagementStatus("success");
      } else {
        addLog(`User management error: ${result.error || 'Unknown error'}`, "error");
        setUserManagementStatus("error");
      }
    } catch (error) {
      addLog(`User management exception: ${error.message}`, "error");
      setUserManagementStatus("error");
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  const testSessionPersistence = async () => {
    addLog("Testing session persistence...", "info");
    
    try {
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      
      if (sessionData) {
        addLog(`Session API response: ${JSON.stringify(sessionData)}`, "success");
      } else {
        addLog("No session data from API", "warning");
      }
    } catch (error) {
      addLog(`Session test error: ${error.message}`, "error");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/" style={{ color: "#0066cc", textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </div>
      
      <h1>Google OAuth Authentication Debug</h1>
      
      {/* Session Status */}
      <div style={{ 
        backgroundColor: status === "authenticated" ? "#d4edda" : "#f8d7da", 
        padding: "15px", 
        borderRadius: "5px", 
        marginBottom: "20px",
        border: `1px solid ${status === "authenticated" ? "#c3e6cb" : "#f5c6cb"}`
      }}>
        <h3>Current Session Status: {status}</h3>
        {session ? (
          <div>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Name:</strong> {session.user?.name}</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Image:</strong> {session.user?.image}</p>
            <p><strong>Expires:</strong> {session.expires}</p>
          </div>
        ) : (
          <p>No active session</p>
        )}
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Authentication Tests</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {!session ? (
            <button 
              onClick={testGoogleSignIn}
              disabled={isTestingAuth}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: isTestingAuth ? "not-allowed" : "pointer",
                opacity: isTestingAuth ? 0.6 : 1
              }}
            >
              {isTestingAuth ? "Testing..." : "Test Google Sign-In"}
            </button>
          ) : (
            <>
              <button 
                onClick={testUserManagement}
                disabled={userManagementStatus === "testing"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: userManagementStatus === "testing" ? "not-allowed" : "pointer",
                  opacity: userManagementStatus === "testing" ? 0.6 : 1
                }}
              >
                {userManagementStatus === "testing" ? "Testing..." : "Test User Management"}
              </button>
              
              <button 
                onClick={testSessionPersistence}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Test Session Persistence
              </button>
              
              <button 
                onClick={() => signOut({ callbackUrl: "/auth-debug" })}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Sign Out
              </button>
            </>
          )}
          
          <button 
            onClick={clearLogs}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Providers Info */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Available Providers</h3>
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "5px",
          border: "1px solid #dee2e6"
        }}>
          {providers ? (
            <pre>{JSON.stringify(providers, null, 2)}</pre>
          ) : (
            <p>Loading providers...</p>
          )}
        </div>
      </div>

      {/* Debug Logs */}
      <div>
        <h3>Debug Logs</h3>
        <div style={{ 
          backgroundColor: "#000", 
          color: "#fff", 
          padding: "15px", 
          borderRadius: "5px",
          maxHeight: "400px",
          overflowY: "auto",
          fontFamily: "monospace",
          fontSize: "12px"
        }}>
          {debugLogs.length === 0 ? (
            <p>No logs yet...</p>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} style={{
                color: log.type === "error" ? "#ff6b6b" : 
                       log.type === "success" ? "#51cf66" : 
                       log.type === "warning" ? "#ffd43b" : "#74c0fc",
                marginBottom: "5px"
              }}>
                <span style={{ color: "#adb5bd" }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Environment Check */}
      <div style={{ marginTop: "20px" }}>
        <h3>Environment Check</h3>
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "5px",
          border: "1px solid #dee2e6"
        }}>
          {isClient ? (
            <>
              <p><strong>NEXTAUTH_URL:</strong> {envVars.nextauthUrl || "Not set"}</p>
              <p><strong>Google Client ID:</strong> {envVars.hasGoogleClientId ? `Set (${envVars.googleClientIdPrefix})` : "Not set"}</p>
              <p><strong>Google Client Secret:</strong> {envVars.hasGoogleClientSecret ? "Set" : "Not set"}</p>
              <p><strong>NextAuth Secret:</strong> {envVars.hasNextauthSecret ? "Set" : "Not set"}</p>
            </>
          ) : (
            <p>Loading environment variables...</p>
          )}
        </div>
      </div>
    </div>
  );
}