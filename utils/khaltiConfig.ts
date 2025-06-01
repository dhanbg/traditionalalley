import axios from "axios";

export const KHALTI_CONFIG = {
  baseUrl: "https://dev.khalti.com/api/v2", // Sandbox environment
  secretKey: process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY ?? "",
} as const;

export const khaltiClient = axios.create({
  baseURL: KHALTI_CONFIG.baseUrl,
  headers: {
    Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
    "Content-Type": "application/json",
  },
}); 