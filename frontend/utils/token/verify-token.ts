import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
}

export default async function verifyToken(token: string): Promise<boolean> {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);

    if (!decodedToken.exp) {
      throw new Error("Invalid or missing expiration in token");
    }

    return decodedToken.exp > Date.now() / 1000;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}
