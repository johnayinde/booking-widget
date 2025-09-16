import React from "react";
import { Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { apiService } from "../../services/api";

const EventCard = ({ event, onSelect }) => {
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getEventStatus = () => {
    const now = new Date();
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    if (now < eventStart) return "upcoming";
    if (now >= eventStart && now <= eventEnd) return "ongoing";
    return "ended";
  };

  const getStatusBadge = () => {
    const status = getEventStatus();
    const statusConfig = {
      upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-800" },
      ongoing: { label: "Live Now", className: "bg-green-100 text-green-800" },
      ended: { label: "Ended", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const eventDate = formatEventDate(event.start_time);
  const isEventEnded = getEventStatus() === "ended";
  const availableTickets = event.available_ticket || 0;
  const totalTickets = event.total_ticket || 0;
  const isSoldOut = availableTickets === 0 && totalTickets > 0;

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 
        hover:shadow-lg hover:scale-[1.02] cursor-pointer group
        ${isEventEnded ? "opacity-75" : ""}
      `}
      onClick={!isEventEnded ? onSelect : undefined}
    >
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback gradient background */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 
            flex items-center justify-center
            ${event.image ? "hidden" : "flex"}
          `}
        >
          <Calendar size={32} className="text-white/70" />
        </div>

        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2 text-center shadow-md">
          <div className="text-lg font-bold text-gray-900">{eventDate.day}</div>
          <div className="text-xs font-medium text-gray-600 uppercase">
            {eventDate.month}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">{getStatusBadge()}</div>

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-4 space-y-3">
        {/* Event Name */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {event.name}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {/* Time */}
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <span>{eventDate.time}</span>
          </div>

          {/* Location */}
          {event.address && (
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-gray-400" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
          )}

          {/* Category */}
          {event.category && (
            <div className="flex items-center space-x-2">
              <Tag size={16} className="text-gray-400" />
              <span>{event.category.name || event.category}</span>
            </div>
          )}

          {/* Tickets Available */}
          {totalTickets > 0 && (
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-400" />
              <span>
                {availableTickets} of {totalTickets} tickets available
              </span>
            </div>
          )}
        </div>

        {/* Event Type */}
        {event.type && (
          <div className="flex justify-between items-center">
            <span
              className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${
                event.type === "online"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-orange-100 text-orange-800"
              }
            `}
            >
              {event.type === "online" ? "Virtual Event" : "In-Person Event"}
            </span>
          </div>
        )}

        {/* Price Range */}
        {event.start_price !== undefined && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Starting from</span>
              <span className="text-lg font-bold text-primary-600">
                {event.start_price === 0
                  ? "FREE"
                  : apiService.formatCurrency(event.start_price)}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3">
          {isEventEnded ? (
            <button
              className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              disabled
            >
              Event Ended
            </button>
          ) : isSoldOut ? (
            <button
              className="w-full py-2 px-4 bg-red-100 text-red-600 rounded-lg font-medium cursor-not-allowed"
              disabled
            >
              Sold Out
            </button>
          ) : (
            <button
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
