import axios from "axios";

export default class ApiService {

  static BASE_URL = "http://localhost:8081";
 
  static getHeader() {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  /** AUTH **/

  static async registerUser(registration) {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/register`, registration);
    return response.data;
  }

  static async loginUser(loginDetails) {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/authenticate`, loginDetails, {
      withCredentials: true // important for sending cookies
    });
    return response.data;
  }

  static async refreshToken() {
    const response = await axios.post(`${this.BASE_URL}/api/v1//auth/refresh-token`, {}, {
      withCredentials: true
    });
    return response.data;


    
  }
}


