import React from "react";
import { Calendar, X } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { Modal } from "../common";
import EventList from "../EventList/EventList";
import EventDetails from "../EventDetails/EventDetails";
import TicketSelection from "../TicketSelection/TicketSelection";
import BookingForm from "../BookingForm/BookingForm";
import PaymentProcessing from "../PaymentProcessing/PaymentProcessing";
import PaymentSuccess from "../PaymentSuccess/PaymentSuccess";

const BookingWidget = () => {
  const { isOpen, currentStep, config, toggleWidget, resetBooking } =
    useBooking();

  const handleClose = () => {
    toggleWidget();
    // Reset booking state when closing
    setTimeout(() => {
      resetBooking();
    }, 300);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "events":
        return <EventList />;
      case "details":
        return <EventDetails />;
      case "tickets":
        return <TicketSelection />;
      case "booking":
        return <BookingForm />;
      case "processing":
        return <PaymentProcessing />;
      case "payment":
        return <PaymentSuccess />;
      default:
        return <EventList />;
    }
  };

  const getStepTitle = () => {
    const titles = {
      events: "Browse Events",
      details: "Event Details",
      tickets: "Select Tickets",
      booking: "Customer Information",
      processing: "Payment",
      payment: "Booking Confirmation",
    };
    return titles[currentStep] || "Event Booking";
  };

  return (
    <>
      {/* Trigger Button */}
      <TriggerButton onClick={toggleWidget} config={config} />

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={getStepTitle()}
        size="lg"
      >
        <div className="p-6">{renderCurrentStep()}</div>
      </Modal>
    </>
  );
};

// Trigger Button Component
const TriggerButton = ({ onClick, config }) => {
  const primaryColor = config.branding?.primaryColor || "#3b82f6";

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="group relative w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-30"
        style={{
          backgroundColor: primaryColor,
          focusRingColor: primaryColor + "4D", // Add transparency
        }}
        aria-label="Open event booking"
      >
        {/* Icon */}
        <Calendar
          size={24}
          className="text-white mx-auto transition-transform group-hover:scale-110"
        />

        {/* Ripple Effect */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-soft opacity-75"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Book Event Tickets
          <div className="absolute top-full right-3 w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
        </div>
      </button>
    </div>
  );
};

export default BookingWidget;
