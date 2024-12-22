import OTP from "@/database/otp.model";
import { connectToDatabase } from "../mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";

const formatPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.startsWith("0")) {
    return "+84" + phoneNumber.slice(1);
  }
  if (phoneNumber.startsWith("+84")) {
    return phoneNumber;
  }
  throw new Error("Invalid phone number format");
};

export const sendSMS = async (phoneNumber: string) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const API_KEY =
    "9b711f8223b2abb560e2bee66b08e9b5-1fc5ccf0-7349-4d96-a97f-b14f3ae45de6";
  const BASE_URL = "https://wglmk8.api.infobip.com";

  try {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const data = {
      messages: [
        {
          from: "Mingo",
          destinations: [
            {
              to: formattedPhoneNumber,
            },
          ],
          text: `Your OTP code is: ${otpCode}`,
        },
      ],
    };

    const response = await axios.post(`${BASE_URL}/sms/2/text/advanced`, data, {
      headers: {
        Authorization: `App ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    await OTP.create({
      code: otpCode,
      receiver: formattedPhoneNumber,
      createAt: new Date(),
      expiredAt: new Date(Date.now() + 5 * 60 * 1000), // OTP hết hạn sau 5 phút
    });

    return {
      message: "OTP sent successfully",
      response: response.data,
    };
  } catch (error: any) {
    console.error(
      "Error sending SMS via Infobip:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send OTP");
  }
};

export async function checkToken(rareToken: string) {
  try {
    const token = rareToken && rareToken.split(" ")[1];
    const decodedToken = jwt.decode(token) as { exp: number } | null;
    if (!decodedToken || !decodedToken.exp) {
      throw new Error("Token is invalid");
    }

    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedToken.exp > currentTime) {
      return { isAuthenticated: true };
    }
    return { isAuthenticated: false };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const verifyOTP = async (phoneNumber: string, inputCode: string) => {
  try {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const otpRecord = await OTP.findOne({
      receiver: formattedPhoneNumber,
    })
      .sort({ createAt: -1 })
      .exec();

    if (!otpRecord) {
      throw new Error("OTP not found or expired");
    }

    if (new Date() > otpRecord.expiredAt) {
      throw new Error("OTP has expired");
    }

    if (otpRecord.code !== inputCode) {
      throw new Error("Invalid OTP code");
    }

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to verify OTP",
    };
  }
};
