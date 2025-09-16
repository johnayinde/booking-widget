import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Lock,
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const BookingForm = () => {
  const {
    selectedEvent,
    selectedTickets,
    totalAmount,
    customerInfo,
    setStep,
    updateCustomerInfo,
    setLoading,
    setError,
    setBookingReference,
    loading,
  } = useBooking();

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!customerInfo.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!customerInfo.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!customerInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    updateCustomerInfo({ [field]: value });

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare booking data according to API structure
      const bookingData = {
        event_id: selectedEvent.id,
        // customer_info: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        // },
        selected_tickets: selectedTickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          count: ticket.quantity,
          seat_name: "", // For events without seating
          type: ticket.type,
        })),
        payment_type: totalAmount > 0 ? "online" : "free",
        payment_status: totalAmount > 0 ? "pending" : "completed",
        total_amount: totalAmount,
      };

      const result = await apiService.createBooking(bookingData);

      if (result.success) {
        const bookingRef =
          result.data.booking_ref ||
          result.data.order_id ||
          result.data.order_ids?.[0];
        setBookingReference(bookingRef);

        if (totalAmount > 0) {
          // Paid event - redirect to payment processing
          setStep("processing");
        } else {
          // Free event - go directly to success page
          setStep("payment");
        }
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch (err) {
      setError(
        "An error occurred while creating your booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalSelectedTickets = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("tickets")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Tickets</span>
        </button>
      </div>

      {/* Event Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedEvent.name}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{apiService.formatDate(selectedEvent.start_time)}</p>
          {selectedEvent.address && <p>{selectedEvent.address}</p>}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-primary-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Order Summary</h3>

        {selectedTickets.map((ticket) => (
          <div key={ticket.id} className="flex justify-between text-sm">
            <span>
              {ticket.name} × {ticket.quantity}
            </span>
            <span>
              {apiService.formatCurrency(ticket.price * ticket.quantity)}
            </span>
          </div>
        ))}

        <div className="border-t border-primary-200 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total ({getTotalSelectedTickets()} tickets)</span>
            <span>{apiService.formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Customer Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={`
                    w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    }
                  `}
                  placeholder="Enter your first name"
                />
              </div>
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={`
                    w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    ${
                      formErrors.lastName ? "border-red-500" : "border-gray-300"
                    }
                  `}
                  placeholder="Enter your last name"
                />
              </div>
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`
                    w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    ${formErrors.email ? "border-red-500" : "border-gray-300"}
                  `}
                  placeholder="Enter your email"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`
                    w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    ${formErrors.phone ? "border-red-500" : "border-gray-300"}
                  `}
                  placeholder="Enter your phone number"
                />
              </div>
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information Note */}
        {totalAmount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock size={16} className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Payment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You'll be redirected to a secure payment page to complete your
                  purchase. Your payment information is protected with
                  industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Free Event Note */}
        {totalAmount === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar size={16} className="text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-green-900">Free Event</h4>
                <p className="text-sm text-green-700 mt-1">
                  This is a free event. Your tickets will be confirmed
                  immediately after submitting your information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2
              ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              } text-white
            `}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {totalAmount > 0
                  ? `Proceed to Payment - ${apiService.formatCurrency(
                      totalAmount
                    )}`
                  : "Confirm Free Booking"}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
