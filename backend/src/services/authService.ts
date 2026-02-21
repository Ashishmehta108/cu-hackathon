import twilio from "twilio";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

// Initialize Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Twilio Verify Service SID
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─────────────────────────────────────────────
// Utility: Normalize phone number (E.164 format)
// ─────────────────────────────────────────────
function normalizePhone(phone: string): string {
  if (phone.startsWith("+")) {
    return phone;
  } else {
    // Assume Indian number, add +91
    return `+91${phone}`;
  }
}

// ─────────────────────────────────────────────
// Send OTP
// ─────────────────────────────────────────────
export async function sendOTP(
  phone: string
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedPhone = normalizePhone(phone);

    // Send verification code via Twilio Verify
    await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: normalizedPhone, channel: 'sms' });

    return { success: true, message: "OTP sent successfully" };
  } catch (error: any) {
    console.error("Twilio send error:", error);
    return { success: false, message: "Failed to send OTP" };
  }
}

// ─────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────
export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const normalizedPhone = normalizePhone(phone);

    // Check verification code via Twilio Verify
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: normalizedPhone, code: otp });

    if (verificationCheck.status === 'approved') {
      // Generate secure session token
      const token = crypto.randomBytes(32).toString("hex");

      // Store session for 1 hour
      await redis.set(`auth:${normalizedPhone}`, token, { ex: 3600 });

      return { success: true, message: "OTP verified", token };
    } else {
      return { success: false, message: "Invalid OTP" };
    }
  } catch (error: any) {
    console.error("OTP verify error:", error);
    return { success: false, message: "Verification failed" };
  }
}

// ─────────────────────────────────────────────
// Validate Token
// ─────────────────────────────────────────────
export async function validateToken(
  phone: string,
  token: string
): Promise<boolean> {
  try {
    const normalizedPhone = normalizePhone(phone);
    const storedToken = await redis.get<string>(`auth:${normalizedPhone}`);

    return storedToken === token;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}