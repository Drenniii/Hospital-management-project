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

    if (response.data) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userRole", response.data.role);
    }

    return response.data;
  }

  /** TASK CRUD **/

  static async getAllTasks() {
    const response = await axios.get(`${this.BASE_URL}/api/v1/tasks`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async getTaskById(taskId) {
    const response = await axios.get(`${this.BASE_URL}/api/v1/tasks/${taskId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async createTask(taskData) {
    const response = await axios.post(`${this.BASE_URL}/api/v1/tasks`, taskData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async updateTask(taskId, updatedTaskData) {
    const response = await axios.put(`${this.BASE_URL}/api/v1/tasks/${taskId}`, updatedTaskData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async deleteTask(taskId) {
    const response = await axios.delete(`${this.BASE_URL}/api/v1/tasks/${taskId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async logoutUser() {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/logout`, {}, {
      headers: this.getHeaders()
    });
    this.clearStorage();
    return response.data;
  }

  // === USER API ===

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/api/v1/users/get`, {
      headers: this.getHeaders()
    });
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

  static async changePassword(passwordData) {
    const response = await axios.patch(
      `${this.BASE_URL}/api/v1/users/change-password`,
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmationPassword: passwordData.confirmationPassword
      },
      {
        headers: this.getHeaders()
      }
    );
    return response.data;
  }

  /** Get Users by Role **/
  static async getUsersByRole(role) {
    const response = await axios.get(`${this.BASE_URL}/api/v1/users/role/${role}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  /** Therapist API **/
  static async getAllTherapists() {
    return this.getUsersByRole("THERAPIST");
  }

  /** Nutritionist API **/
  static async getAllNutritionists() {
    return this.getUsersByRole("NUTRICIST");
  }

  /** Appointment API **/
  static async createAppointment(clientId, professionalId, appointmentDateTime, type, notes = "") {
    try {
      const formData = new FormData();
      formData.append('clientId', clientId.toString());
      formData.append('professionalId', professionalId.toString());
      formData.append('appointmentDateTime', appointmentDateTime);
      formData.append('type', type);
      formData.append('notes', notes || "");

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/appointments/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('CreateAppointment error:', error.response || error);
      throw error;
    }
  }

  static async getClientAppointments() {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      const user = await this.getCurrentUser();
      const response = await axios.get(`${this.BASE_URL}/api/v1/appointments/client`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('GetClientAppointments error:', error.response || error);
      throw error;
    }
  }

  static async getProfessionalAppointments() {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${this.BASE_URL}/api/v1/appointments/professional`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('GetProfessionalAppointments error:', error.response || error);
      throw error;
    }
  }

  static async updateAppointmentStatus(appointmentId, status) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.patch(
        `${this.BASE_URL}/api/v1/appointments/${appointmentId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('UpdateAppointmentStatus error:', error.response || error);
      throw error;
    }
  }

  static async deleteAppointment(appointmentId) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.delete(
        `${this.BASE_URL}/api/v1/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('DeleteAppointment error:', error.response || error);
      throw error;
    }
  }
}
