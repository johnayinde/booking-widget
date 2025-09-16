import axios from "axios";

class ApiService {
  constructor() {
    this.baseURL =
      (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
      "http://127.0.0.1:8000/api";
    this.timeout = 15000; // 15 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for tracking
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (
          typeof process !== "undefined" &&
          process.env?.NODE_ENV === "development" &&
          response.config.metadata
        ) {
          const endTime = new Date();
          const duration = endTime - response.config.metadata.startTime;
          console.log(
            `API Response: ${response.config.url} took ${duration}ms`
          );
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Network error handling
        if (!error.response) {
          if (this.isNetworkError(error)) {
            throw new ApiError(
              "NETWORK_ERROR",
              "Please check your internet connection",
              error
            );
          }
          throw new ApiError(
            "TIMEOUT_ERROR",
            "Request timed out. Please try again.",
            error
          );
        }

        // HTTP error handling
        const { status, data } = error.response;

        // Retry logic for certain status codes
        if (this.shouldRetry(status) && !originalRequest._retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount <= this.retryAttempts) {
            await this.delay(this.retryDelay * originalRequest._retryCount);
            return this.client(originalRequest);
          }
        }

        // Handle specific status codes
        switch (status) {
          case 400:
            throw new ApiError(
              "BAD_REQUEST",
              data?.message || "Invalid request",
              error
            );
          case 401:
            this.handleUnauthorized();
            throw new ApiError("UNAUTHORIZED", "Please log in again", error);
          case 403:
            throw new ApiError("FORBIDDEN", "Access denied", error);
          case 404:
            throw new ApiError("NOT_FOUND", "Resource not found", error);
          case 422:
            throw new ApiError(
              "VALIDATION_ERROR",
              data?.message || "Validation failed",
              error,
              data?.errors
            );
          case 429:
            throw new ApiError(
              "RATE_LIMIT",
              "Too many requests. Please wait and try again.",
              error
            );
          case 500:
            throw new ApiError(
              "SERVER_ERROR",
              "Server error. Please try again later.",
              error
            );
          case 503:
            throw new ApiError(
              "SERVICE_UNAVAILABLE",
              "Service temporarily unavailable",
              error
            );
          default:
            throw new ApiError(
              "UNKNOWN_ERROR",
              data?.message || "An unexpected error occurred",
              error
            );
        }
      }
    );
  }

  // Utility methods
  isNetworkError(error) {
    return error.code === "NETWORK_ERROR" || error.message === "Network Error";
  }

  shouldRetry(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getAuthToken() {
    return (
      localStorage.getItem("booking_token") ||
      sessionStorage.getItem("booking_token")
    );
  }

  setAuthToken(token) {
    localStorage.setItem("booking_token", token);
  }

  removeAuthToken() {
    localStorage.removeItem("booking_token");
    sessionStorage.removeItem("booking_token");
  }

  handleUnauthorized() {
    this.removeAuthToken();
    // Could emit an event or call a callback here
  }

  // API methods
  async getEvents(params = {}) {
    try {
      const response = await this.client.get("/lca/events/list", { params });
      return this.handleSuccess(response.data);
    } catch (error) {
      return this.handleError(error, "Failed to fetch events");
    }
  }

  async getEventDetails(eventId) {
    try {
      const response = await this.client.get(`/lca/events/detail/${eventId}`);
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to fetch event details");
    }
  }

  async getEventTickets(eventId) {
    try {
      const response = await this.client.get(
        `/lca/events/seat-tickets/${eventId}`
      );
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to fetch event tickets");
    }
  }

  async getEventCategories() {
    try {
      const response = await this.client.get("/lca/events/categories");
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to fetch categories");
    }
  }

  async createBooking(bookingData) {
    try {
      const response = await this.client.post(
        "/lca/create-booking",
        bookingData
      );
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to create booking");
    }
  }

  async getUserBookedEvents() {
    try {
      const response = await this.client.get("/lca/user-booked-event");
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to fetch booked events");
    }
  }

  // Payment API methods
  async generatePaymentLink(
    bookingReference,
    callbackUrl = null,
    cancelUrl = null
  ) {
    try {
      const response = await this.client.post("/lca/payment/generate-link", {
        booking_reference: bookingReference,
        callback_url: callbackUrl,
        cancel_url: cancelUrl,
      });
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to generate payment link");
    }
  }

  async verifyPayment(paymentReference) {
    try {
      const response = await this.client.post("/lca/payment/verify", {
        payment_reference: paymentReference,
      });
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to verify payment");
    }
  }

  async getPaymentStatus(bookingReference) {
    try {
      const response = await this.client.get("/lca/payment/status", {
        params: { booking_reference: bookingReference },
      });
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error, "Failed to get payment status");
    }
  }

  // Response handlers
  handleSuccess(response) {
    const data = response.data;
    return {
      success: true,
      data: data.data || data,
      message: data.message || "Success",
      meta: data.meta || null,
    };
  }

  handleError(error, defaultMessage) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        data: null,
        validationErrors: error.validationErrors,
      };
    }

    // Fallback for unexpected errors
    return {
      success: false,
      error: defaultMessage,
      code: "UNKNOWN_ERROR",
      data: null,
    };
  }

  // Utility methods for formatting
  formatCurrency(amount, currency = "NGN") {
    if (amount === 0) return "FREE";

    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `₦${amount.toLocaleString()}`;
    }
  }

  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  formatTime(dateString) {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateString;
    }
  }

  formatDateTime(dateString) {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return dateString;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get("/health");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Clear cache (if you implement caching later)
  clearCache() {
    // Implementation for clearing any cached data
    if ("caches" in window) {
      caches.delete("api-cache");
    }
  }
}

// Custom Error class for API errors
class ApiError extends Error {
  constructor(code, message, originalError = null, validationErrors = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.originalError = originalError;
    this.validationErrors = validationErrors;
  }
}
// Export singleton instance
export const apiService = new ApiService();
export default apiService;
export { ApiError };
