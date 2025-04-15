// decodeToken.ts
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Function to decode JWT
const decodeToken = (token: string): JwtPayload | null => {
  if (!token) {
    console.error("No token provided");
    return null;
  }

  try {
    // Decoding the token without verifying it
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

export default decodeToken;
