import axios from "axios";

export default class ApiService {

  static BASE_URL = "http://localhost:8081";

  // === Helper: get Authorization headers ===
  static getHeaders() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      Authorization: `Bearer ${token}`,
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

  static async logoutUser() {
    const response = await axios.post(`${this.BASE_URL}/api/v1/auth/logout`, {}, {
      headers: this.getHeaders()
    });
    this.clearStorage();
    return response.data;
  }

  // === TASK CRUD ===

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

  // === Appointments ===

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
        `${this.BASE_URL}/api/v1/appointments/${appointmentId}/status?status=${status}`,
        null,
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

  // === Notifications ===

  static async getUserNotifications() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/notifications`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async getUnreadNotificationsCount() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/notifications/unread-count`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/api/notifications/${notificationId}/mark-read`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllNotificationsAsRead() {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/api/notifications/mark-all-read`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // === Chat API ===
  static async getChatRooms() {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/api/v1/chat/rooms`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  }

  static async createChatRoom(chatRoomData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/api/v1/chat/rooms/create`,
        chatRoomData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  static async getChatMessages(chatRoomId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/api/v1/chat/messages/${chatRoomId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  static async sendMessage(messageData) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/api/v1/chat/messages/send`,
        messageData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(chatRoomId) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}/api/v1/chat/messages/${chatRoomId}/read`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  static async clearChatMessages(chatRoomId) {
    try {
      const response = await axios.delete(
        `${this.BASE_URL}/api/v1/chat/messages/${chatRoomId}/clear`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing messages:', error);
      throw error;
    }
  }

  // === Appointments History ===
  static async saveAppointmentHistory(appointmentId, historyText) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      console.log('Saving appointment history with token:', token.substring(0, 20) + '...');
      
      const response = await axios.post(
        `${this.BASE_URL}/api/appointments/${appointmentId}/history`,
        { historyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving appointment history:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error
      });
      throw error;
    }
  }

  static async getAppointmentHistories(appointmentId) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      console.log('Getting appointment histories with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(
        `${this.BASE_URL}/api/appointments/${appointmentId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        console.error('Authorization error fetching histories. Token:', this.getAccessToken()?.substring(0, 20) + '...');
      }
      console.error('Error fetching appointment histories:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error
      });
      throw error;
    }
  }

  static async updateAppointmentHistory(historyId, historyText) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error('No authentication token found');

      console.log('Updating appointment history with token:', token.substring(0, 20) + '...');
      
      const response = await axios.put(
        `${this.BASE_URL}/api/appointments/history/${historyId}`,
        { historyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        console.error('Authorization error updating history. Token:', this.getAccessToken()?.substring(0, 20) + '...');
      }
      console.error('Error updating appointment history:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error
      });
      throw error;
    }
  }

  // === Reviews ===
  static async createReview(appointmentId, reviewData) {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      if (!reviewData.rating || !reviewData.comment) {
        throw new Error('Rating and comment are required');
      }

      console.log('Creating review:', {
        endpoint: `${this.BASE_URL}/api/v1/reviews/appointment/${appointmentId}`,
        appointmentId,
        reviewData,
        headers: this.getHeaders()
      });
      
      const response = await axios.post(
        `${this.BASE_URL}/api/v1/reviews/appointment/${appointmentId}`,
        {
          rating: Number(reviewData.rating),
          comment: reviewData.comment.trim()
        },
        { 
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Review creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        appointmentId,
        reviewData
      });
      throw error;
    }
  }

  static async getReviewByAppointment(appointmentId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/v1/reviews/appointment/${appointmentId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  static async getProfessionalReviews(professionalId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/v1/reviews/professional/${professionalId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  static async getProfessionalRating(professionalId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/v1/reviews/professional/${professionalId}/rating`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  static async deleteReview(reviewId) {
    const response = await axios.delete(`${this.BASE_URL}/api/v1/reviews/${reviewId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  static async updateReview(reviewId, reviewData) {
    const response = await axios.put(`${this.BASE_URL}/api/v1/reviews/${reviewId}`, reviewData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // POST /api/payments
  static async processPayment(paymentRequest) {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/api/payments/process`,
        paymentRequest,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error.response || error);
      throw error;
    }
  }

  // GET /api/payments
  static async getAllPayments() {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/payments`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error.response || error);
      throw error;
    }
  }

  // GET /api/payments/credits/{userId}
  static async getUserCredits(userId) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/api/users/${userId}/credits`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user credits:", error.response || error);
      throw error;
    }
  }
} //api