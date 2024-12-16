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
  const OTP = Math.floor(100000 + Math.random() * 900000);
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
          text: `Your OTP code is: ${OTP}`,
        },
      ],
    };

    const response = await axios.post(`${BASE_URL}/sms/2/text/advanced`, data, {
      headers: {
        Authorization: `App ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return {
      otp: OTP,
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
