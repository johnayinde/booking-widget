import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, Users, Clock, Tag } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const TicketSelection = () => {
  const {
    selectedEvent,
    selectedTickets,
    totalAmount,
    setStep,
    updateSelectedTickets,
    setLoading,
    setError,
    loading,
    error,
  } = useBooking();

  const [eventTickets, setEventTickets] = useState(null);

  useEffect(() => {
    if (selectedEvent) {
      loadEventTickets();
    }
  }, [selectedEvent]);

  const loadEventTickets = async () => {
    setLoading(true);
    try {
      const result = await apiService.getEventTickets(selectedEvent.id);
      console.log({ result });

      if (result.success) {
        setEventTickets(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketQuantityChange = (ticket, change) => {
    const currentTicket = selectedTickets.find((t) => t.id === ticket.id);
    const currentQuantity = currentTicket ? currentTicket.quantity : 0;
    const newQuantity = Math.max(
      0,
      Math.min(currentQuantity + change, ticket.ticket_per_order || 10)
    );

    updateSelectedTickets({
      id: ticket.id,
      name: ticket.name,
      price: parseFloat(ticket.price) || 0,
      quantity: newQuantity,
      type: ticket.type,
      description: ticket.description,
    });
  };

  const getTicketQuantity = (ticketId) => {
    const ticket = selectedTickets.find((t) => t.id === ticketId);
    return ticket ? ticket.quantity : 0;
  };

  const getTotalSelectedTickets = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  const handleContinue = () => {
    if (selectedTickets.length > 0) {
      setStep("booking");
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!selectedEvent) {
    return null;
  }
  //   console.log({ eventTickets });

  //   if (loading && !eventTickets.length) {
  //     return (
  //       <div className="flex items-center justify-center h-96">
  //         <LoadingSpinner size="lg" />
  //       </div>
  //     );
  //   }

  if (error && !eventTickets) {
    return (
      <div className="flex items-center justify-center h-96">
        <ErrorMessage message={error} onRetry={loadEventTickets} />
      </div>
    );
  }

  const tickets = eventTickets || [];
  console.log({ tickets });

  //   const hasValidTickets =
  //     tickets.filter((ticket) => !ticket.sold_out).length > 0;
  //   console.log({ hasValidTickets });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("details")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Details</span>
        </button>
      </div>

      {/* Event Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedEvent.name}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{apiService.formatDate(selectedEvent.start_time)}</p>
          <p>
            {formatTime(selectedEvent.start_time)} -{" "}
            {formatTime(selectedEvent.end_time)}
          </p>
          {selectedEvent.address && <p>{selectedEvent.address}</p>}
        </div>
      </div>

      {/* Ticket Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Select Tickets
        </h3>

        {tickets.length ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                quantity={getTicketQuantity(ticket.id)}
                onQuantityChange={handleTicketQuantityChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Tag size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tickets available
            </h3>
            <p className="text-gray-600">
              All tickets for this event are currently sold out.
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {selectedTickets.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Order Summary</h4>

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
      )}

      {/* Continue Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
        <button
          onClick={handleContinue}
          disabled={selectedTickets.length === 0}
          className={`
            w-full py-3 rounded-lg font-medium transition-colors
            ${
              selectedTickets.length > 0
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {selectedTickets.length > 0
            ? `Continue with ${getTotalSelectedTickets()} ticket${
                getTotalSelectedTickets() !== 1 ? "s" : ""
              }`
            : "Select tickets to continue"}
        </button>
      </div>
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ ticket, quantity, onQuantityChange }) => {
  const isAvailable = true;
  const remainingTickets = ticket.quantity - ticket.use_ticket;

  return (
    <div
      className={`
      border rounded-lg p-4 transition-all
      ${
        isAvailable
          ? "border-gray-200 hover:border-primary-300"
          : "border-gray-100 bg-gray-50"
      }
    `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Ticket Name and Type */}
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
            <span
              className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${
                ticket.type === "free"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }
            `}
            >
              {ticket.type === "free" ? "FREE" : "PAID"}
            </span>
          </div>

          {/* Description */}
          {ticket.description && (
            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
          )}

          {/* Ticket Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>
                Sale ends: {new Date(ticket.end_time).toLocaleDateString()}
              </span>
            </div>
            {/* <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{remainingTickets} remaining</span>
            </div> */}
          </div>

          {/* Price */}
          <div className="mt-2">
            <span className="text-lg font-bold text-primary-600">
              {ticket.type === "free" || ticket.price === 0
                ? "FREE"
                : apiService.formatCurrency(ticket.price)}
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          {isAvailable ? (
            <>
              <button
                onClick={() => onQuantityChange(ticket, -1)}
                disabled={quantity === 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={14} />
              </button>

              <span className="w-8 text-center font-medium">{quantity}</span>

              <button
                onClick={() => onQuantityChange(ticket, 1)}
                disabled={quantity >= (ticket.ticket_per_order || 10)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
              </button>
            </>
          ) : (
            <span className="text-sm font-medium text-red-600">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSelection;
