import axios from "axios";

export default class ApiService {

  static BASE_URL = "http://localhost:8081";

  // === Helper: get Authorization headers ===
  static getHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }

  // === AUTH ===

  static async registerUser(registration) {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/register`, registration);
    return response.data;
  }

  static async loginUser(loginDetails) {
    const response = await axios.post(
      `${this.BASE_URL}/api/v1/auth/authenticate`,
      loginDetails,
      { withCredentials: true }
    );

    // After successful login, save tokens and role to localStorage
    if (response.data) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userRole", response.data.role); // assuming backend sends role here
    }

    return response.data;
  }

  static async logoutUser() {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/logout`, {}, { headers: this.getHeaders() });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    return response.data;
  }

  // === USER API ===

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/api/v1/users/get`, { headers: this.getHeaders() });
    return response.data;
  }

  static async deleteUser(userId) {
    const response = await axios.delete(`${this.BASE_URL}/api/v1/users/${userId}`, { headers: this.getHeaders() });
    return response.data;
  }

  static async updateUser(id, updatedUserData) {
    const response = await axios.put(`${this.BASE_URL}/api/v1/users/${id}`, updatedUserData, { headers: this.getHeaders() });
    return response.data;
  }

  static async getCurrentUser() {
    const response = await axios.get(`${this.BASE_URL}/api/v1/users/me`, { headers: this.getHeaders() });
    return response.data;
  }

  static async updateUserProfile(id, updatedUserDataProfile) {
    const response = await axios.put(
      `${this.BASE_URL}/api/v1/users/profile/${id}`,
      updatedUserDataProfile,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // === Role Helpers ===

  static getRole() {
    return localStorage.getItem("userRole");
  }

  static getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  static isAdmin() {
    return this.getRole() === "ADMIN";
  }

  static isUser() {
    return this.getRole() === "USER";
  }

  static isTherapist() {
    return this.getRole() === "THERAPIST";
  }

  static isNutricist() {
    return this.getRole() === "NUTRICIST";
  }

  static clearStorage() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.clear();
  }


static async updateUserProfile(id, updatedUserDataProfile) {
  const response = await axios.put(`${this.BASE_URL}/api/v1/users/profile/${id}`, updatedUserDataProfile, {headers: this.getHeader()
  });
  return response.data; }


static logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }
    

   

  



}
