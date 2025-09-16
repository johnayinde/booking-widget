import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Clock,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import { LoadingSpinner, Button } from "../common";

const PaymentProcessing = () => {
  const {
    selectedEvent,
    selectedTickets,
    customerInfo,
    bookingReference,
    totalAmount,
    setStep,
    setError,
  } = useBooking();

  // State management
  const [paymentState, setPaymentState] = useState("generating");
  const [paymentData, setPaymentData] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationMessage, setVerificationMessage] = useState("");

  // Refs for cleanup
  const verificationTimerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Constants
  const VERIFICATION_MESSAGES = [
    "Contacting your bank...",
    "Verifying payment details...",
    "Confirming transaction...",
    "Processing your booking...",
    "Almost done...",
  ];

  const MAX_VERIFICATION_ATTEMPTS = 8;
  const MAX_RETRY_ATTEMPTS = 5;

  // Initialize payment on mount
  useEffect(() => {
    if (totalAmount > 0) {
      generatePaymentLink();
    } else {
      setStep("payment"); // Free event
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  // Helper Functions
  const cleanupResources = () => {
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.close();
    }
    if (verificationTimerRef.current) {
      clearTimeout(verificationTimerRef.current);
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
  };

  const getTotalSelectedTickets = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  // Payment Link Generation
  const generatePaymentLink = async () => {
    try {
      setPaymentState("generating");
      setError(null);

      if (!bookingReference) {
        throw new Error("Booking reference is required for payment");
      }

      const callbackUrl = `${window.location.origin}/payment/callback`;
      const cancelUrl = `${window.location.origin}/payment/cancel`;

      const result = await apiService.generatePaymentLink(
        bookingReference,
        callbackUrl,
        cancelUrl
      );

      if (result.success) {
        setPaymentData(result.data);
        setPaymentState("ready");
      } else {
        throw new Error(result.error || "Failed to generate payment link");
      }
    } catch (error) {
      console.error("Payment link generation failed:", error);
      setError(error.message || "Failed to generate payment link");
      setPaymentState("error");
    }
  };

  // Progress Management
  const startVerificationProgress = () => {
    setVerificationProgress(0);
    setVerificationMessage(VERIFICATION_MESSAGES[0]);

    let messageIndex = 0;
    let progress = 0;

    progressTimerRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress between 5-20%

      if (progress > 95) {
        progress = 95; // Don't reach 100% until verification is complete
      }

      setVerificationProgress(progress);

      // Update message every 20% progress
      const newMessageIndex = Math.floor(progress / 20);
      if (
        newMessageIndex !== messageIndex &&
        newMessageIndex < VERIFICATION_MESSAGES.length
      ) {
        messageIndex = newMessageIndex;
        setVerificationMessage(VERIFICATION_MESSAGES[messageIndex]);
      }
    }, 800);
  };

  const stopVerificationProgress = (success = false) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (success) {
      setVerificationProgress(100);
      setVerificationMessage("Payment confirmed! Redirecting...");
    }
  };

  // Payment Processing
  const handlePayNow = () => {
    if (!paymentData?.payment_url) return;

    setPaymentState("processing");

    // Open payment window
    const popup = window.open(
      paymentData.payment_url,
      "paystack_payment",
      "width=500,height=700,scrollbars=yes,resizable=yes"
    );

    setPaymentWindow(popup);
    monitorPaymentWindow(popup);
  };

  const monitorPaymentWindow = (popup) => {
    const checkPayment = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPayment);
          setPaymentWindow(null);

          // Start verification process
          setPaymentState("verifying");
          startVerificationProgress();

          verificationTimerRef.current = setTimeout(() => {
            verifyPayment();
          }, 2000);
        }
      } catch (error) {
        // Cross-origin restrictions - continue monitoring
      }
    }, 1000);

    // Auto-verify after 30 seconds
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkPayment);
        setPaymentState("verifying");
        startVerificationProgress();
        verifyPayment();
      }
    }, 30000);
  };

  // Payment Verification
  const verifyPayment = async () => {
    try {
      if (paymentState !== "verifying") {
        setPaymentState("verifying");
        startVerificationProgress();
      }

      setVerificationAttempts((prev) => prev + 1);

      if (!paymentData?.payment_reference) {
        throw new Error("Payment reference is missing");
      }

      const result = await apiService.verifyPayment(
        paymentData.payment_reference
      );

      if (result.success) {
        const { data } = result;

        if (data.is_successful && data.payment_status === "success") {
          handlePaymentSuccess();
        } else if (data.payment_status === "pending") {
          handlePendingPayment();
        } else {
          handlePaymentFailure("Payment was not successful. Please try again.");
        }
      } else {
        throw new Error(result.error || "Failed to verify payment");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      handleVerificationError();
    }
  };

  const handlePaymentSuccess = () => {
    stopVerificationProgress(true);
    setPaymentState("verified");

    // Redirect to success page after showing confirmation
    setTimeout(() => {
      setStep("payment");
    }, 1500);
  };

  const handlePendingPayment = () => {
    if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
      setVerificationMessage("Still processing... Please wait");
      verificationTimerRef.current = setTimeout(() => {
        verifyPayment();
      }, 3000);
    } else {
      stopVerificationProgress(false);
      setPaymentState("pending");
    }
  };

  const handlePaymentFailure = (message) => {
    stopVerificationProgress(false);
    setError(message);
    setPaymentState("failed");
  };

  const handleVerificationError = () => {
    if (verificationAttempts < MAX_RETRY_ATTEMPTS) {
      setVerificationMessage("Retrying verification...");
      verificationTimerRef.current = setTimeout(() => {
        verifyPayment();
      }, 5000);
    } else {
      stopVerificationProgress(false);
      setError(
        "Unable to verify payment. Please contact support if money was debited."
      );
      setPaymentState("error");
    }
  };

  // Event Handlers
  const handleRetry = () => {
    setVerificationAttempts(0);
    setVerificationProgress(0);
    setVerificationMessage("");
    generatePaymentLink();
  };

  const handleBackToBooking = () => {
    if (paymentState === "verifying" || paymentState === "verified") {
      return; // Don't allow navigation during critical states
    }
    setStep("booking");
  };

  // Render Functions
  const renderEventSummary = () => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {selectedEvent.name}
      </h2>
      <div className="text-sm text-gray-600 space-y-1">
        <p>{apiService.formatDate(selectedEvent.start_time)}</p>
        {selectedEvent.address && <p>{selectedEvent.address}</p>}
        <p>Booking: {bookingReference}</p>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
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
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <button
        onClick={handleBackToBooking}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        disabled={paymentState === "verifying" || paymentState === "verified"}
      >
        <ArrowLeft size={20} />
        <span>Back to Details</span>
      </button>
    </div>
  );

  const renderGeneratingState = () => (
    <div className="text-center py-12">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Setting up payment...
      </h3>
      <p className="text-gray-600">We're preparing your secure payment link</p>
    </div>
  );

  const renderReadyState = () => (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Secure Payment
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-blue-700">Amount to pay:</span>
            <span className="font-bold text-blue-900">
              {apiService.formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Payment method:</span>
            <span className="text-blue-900">Card, Bank Transfer, USSD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Security:</span>
            <span className="text-blue-900 flex items-center">
              <Shield size={16} className="mr-1" />
              256-bit SSL encryption
            </span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayNow}
        size="lg"
        className="w-full"
        icon={<CreditCard size={20} />}
      >
        Pay {apiService.formatCurrency(totalAmount)} Now
      </Button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-600">
        <p>You will be redirected to Paystack's secure payment page.</p>
        <p>Your payment information is protected and encrypted.</p>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExternalLink size={24} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Complete your payment
        </h3>
        <p className="text-gray-600 mb-4">
          A secure payment window has opened. Please complete your payment
          there.
        </p>
        <LoadingSpinner size="lg" className="mx-auto mb-4" />

        {paymentWindow && !paymentWindow.closed && (
          <Button
            onClick={() => paymentWindow.focus()}
            variant="outline"
            size="sm"
          >
            Return to payment window
          </Button>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Important:</strong> Don't close this page until payment is
          complete. We'll automatically verify your payment when you're done.
        </p>
      </div>
    </div>
  );

  const renderVerifyingState = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LoadingSpinner size="lg" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Verifying your payment
        </h3>

        <p className="text-gray-600 mb-6">{verificationMessage}</p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Processing...</span>
            <span>{Math.round(verificationProgress)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>Verification attempt {verificationAttempts}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Please wait:</strong> We're confirming your payment with the
          bank. This usually takes 10-30 seconds.
        </p>
      </div>
    </div>
  );

  const renderVerifiedState = () => (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Payment Confirmed!
        </h3>

        <p className="text-gray-600 mb-4">
          Your payment has been successfully verified.
        </p>

        {/* Completed Progress Bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-green-600 h-full rounded-full transition-all duration-500" />
          </div>
          <div className="text-center text-sm text-green-600 mt-2 font-medium">
            Verification Complete ✓
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Redirecting to confirmation page...
        </div>
      </div>
    </div>
  );

  const renderPendingState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock size={24} className="text-yellow-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Payment verification taking longer than expected
      </h3>
      <p className="text-gray-600 mb-6">
        Your payment is being processed. This can take a few minutes.
      </p>

      <div className="space-y-4">
        <Button onClick={verifyPayment} variant="outline">
          Check payment status again
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Payment Reference:</strong> {paymentData?.payment_reference}
            <br />
            Keep this reference for your records.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFailedState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-red-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">Payment failed</h3>
      <p className="text-gray-600 mb-6">
        Your payment could not be processed. Please try again.
      </p>

      <Button onClick={handleRetry}>Try payment again</Button>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={24} className="text-red-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Payment setup failed
      </h3>
      <p className="text-gray-600 mb-6">
        We couldn't set up your payment. Please try again or contact support.
      </p>

      <div className="space-y-3">
        <Button onClick={handleRetry}>Try again</Button>

        <Button onClick={() => setStep("booking")} variant="outline">
          Back to booking details
        </Button>
      </div>
    </div>
  );

  const renderPaymentState = () => {
    switch (paymentState) {
      case "generating":
        return renderGeneratingState();
      case "ready":
        return renderReadyState();
      case "processing":
        return renderProcessingState();
      case "verifying":
        return renderVerifyingState();
      case "verified":
        return renderVerifiedState();
      case "pending":
        return renderPendingState();
      case "failed":
        return renderFailedState();
      case "error":
        return renderErrorState();
      default:
        return null;
    }
  };

  // Main Render
  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderEventSummary()}
      {renderOrderSummary()}
      {renderPaymentState()}
    </div>
  );
};

export default PaymentProcessing;
