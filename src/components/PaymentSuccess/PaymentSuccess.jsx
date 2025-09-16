import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Mail,
  Download,
  Share2,
  ExternalLink,
  Printer,
  Clock,
  CreditCard,
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import { Button } from "../common";

const PaymentSuccess = () => {
  const {
    selectedEvent,
    selectedTickets,
    customerInfo,
    bookingReference,
    totalAmount,
    resetBooking,
    toggleWidget,
  } = useBooking();

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [downloadingTickets, setDownloadingTickets] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Simulate payment details loading
    setTimeout(() => {
      setPaymentDetails({
        paymentMethod: totalAmount > 0 ? "Paystack" : "Free",
        transactionId: `TXN-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        status: "completed",
      });
    }, 1000);

    // Simulate email confirmation
    setTimeout(() => {
      setEmailSent(true);
    }, 2000);
  }, [totalAmount]);

  const handleDownloadTickets = async () => {
    setDownloadingTickets(true);

    try {
      // Simulate ticket generation and download
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would:
      // 1. Call an API to generate PDF tickets
      // 2. Download the PDF file
      // 3. Or open a new window with the tickets

      const ticketData = {
        bookingReference,
        eventName: selectedEvent.name,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        tickets: selectedTickets,
        eventDate: selectedEvent.start_time,
        totalAmount,
      };

      // Create a mock PDF download
      const blob = new Blob([JSON.stringify(ticketData, null, 2)], {
        type: "application/json",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets-${bookingReference}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download tickets:", error);
    } finally {
      setDownloadingTickets(false);
    }
  };

  const handlePrintTickets = () => {
    // Create a printable version of the tickets
    const printWindow = window.open("", "_blank");
    const ticketHtml = generateTicketHTML();

    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const generateTicketHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event Tickets - ${bookingReference}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .ticket { border: 2px solid #ddd; margin: 20px 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .qr-code { width: 100px; height: 100px; background: #f0f0f0; margin: 10px auto; }
            .details { display: flex; justify-content: space-between; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedEvent.name}</h1>
            <p>Booking Reference: ${bookingReference}</p>
          </div>
          
          ${selectedTickets
            .map(
              (ticket, index) => `
            <div class="ticket">
              <h3>Ticket ${index + 1}: ${ticket.name}</h3>
              <div class="details">
                <div>
                  <p><strong>Date:</strong> ${apiService.formatDate(
                    selectedEvent.start_time
                  )}</p>
                  <p><strong>Time:</strong> ${apiService.formatTime(
                    selectedEvent.start_time
                  )}</p>
                  <p><strong>Venue:</strong> ${
                    selectedEvent.address || "TBA"
                  }</p>
                  <p><strong>Ticket Holder:</strong> ${
                    customerInfo.firstName
                  } ${customerInfo.lastName}</p>
                </div>
                <div class="qr-code">QR CODE</div>
              </div>
            </div>
          `
            )
            .join("")}
          
          <div class="footer">
            <p>Please present this ticket at the venue entrance.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: `I'm attending ${selectedEvent.name}`,
      text: `Join me at ${selectedEvent.name} on ${apiService.formatDate(
        selectedEvent.start_time
      )}!`,
      url: window.location.origin,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log("Error sharing:", err);
          fallbackShare(shareData);
        }
      }
    } else {
      fallbackShare(shareData);
    }
  };

  const fallbackShare = (shareData) => {
    // Fallback: copy to clipboard
    const textToCopy = `${shareData.text} ${shareData.url}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Show success message
      const notification = document.createElement("div");
      notification.textContent = "Event link copied to clipboard!";
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #10b981; color: white; padding: 12px 24px;
        border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    });
  };

  const handleViewEventDetails = () => {
    // Open event details in new tab or navigate
    window.open(`/events/${selectedEvent.id}`, "_blank");
  };

  const handleBookAnother = () => {
    resetBooking();
  };

  const handleClose = () => {
    toggleWidget();
    setTimeout(() => {
      resetBooking();
    }, 300);
  };

  const getTotalSelectedTickets = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600">
          Your tickets have been successfully booked. You'll receive a
          confirmation email shortly.
        </p>
      </div>

      {/* Booking Reference */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700 mb-1">Booking Reference</p>
        <p className="text-lg font-bold text-green-900">{bookingReference}</p>
      </div>

      {/* Event Summary */}
      <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
        <h3 className="font-semibold text-gray-900">Event Details</h3>

        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Calendar size={16} className="text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">{selectedEvent.name}</p>
              <p className="text-sm text-gray-600">
                {apiService.formatDate(selectedEvent.start_time)}
              </p>
              <p className="text-sm text-gray-600">
                {apiService.formatTime(selectedEvent.start_time)} -{" "}
                {apiService.formatTime(selectedEvent.end_time)}
              </p>
            </div>
          </div>

          {selectedEvent.address && (
            <div className="flex items-start space-x-3">
              <MapPin size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">{selectedEvent.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Mail size={16} className="text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-600">
                Confirmation sent to: {customerInfo.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Summary */}
      <div className="bg-primary-50 rounded-lg p-4 text-left space-y-3">
        <h3 className="font-semibold text-gray-900">Ticket Summary</h3>

        <div className="space-y-2">
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
        </div>

        <div className="border-t border-primary-200 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total ({getTotalSelectedTickets()} tickets)</span>
            <span>{apiService.formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <h3 className="font-semibold text-gray-900 mb-2">
          Customer Information
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Name:</span> {customerInfo.firstName}{" "}
            {customerInfo.lastName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {customerInfo.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {customerInfo.phone}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadTickets}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            <span>Download Tickets</span>
          </button>

          <button
            onClick={handleShareEvent}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            <Share2 size={16} />
            <span>Share Event</span>
          </button>
        </div>

        <button
          onClick={handleBookAnother}
          className="w-full px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
        >
          Book Another Event
        </button>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h4 className="font-medium text-blue-900 mb-2">
          Important Information
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Please keep your booking reference for your records</li>
          <li>• Check your email for detailed tickets and event information</li>
          <li>
            • Arrive at the venue at least 15 minutes before the event starts
          </li>
          <li>
            • Contact support if you need to make any changes to your booking
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentSuccess;
