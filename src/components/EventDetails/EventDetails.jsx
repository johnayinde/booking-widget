import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Tag,
  Globe,
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const EventDetails = () => {
  const { selectedEvent, setStep, setLoading, setError, loading, error } =
    useBooking();

  const [eventDetails, setEventDetails] = useState(null);
  const [eventTickets, setEventTickets] = useState(null);

  useEffect(() => {
    if (selectedEvent) {
      loadEventDetails();
      loadEventTickets();
    }
  }, [selectedEvent]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const result = await apiService.getEventDetails(selectedEvent.id);
      if (result.success) {
        setEventDetails(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const loadEventTickets = async () => {
    try {
      const result = await apiService.getEventTickets(selectedEvent.id);

      if (result.success) {
        setEventTickets(result.data);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleBookTickets = () => {
    setStep("tickets");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedEvent.name,
          text: `Check out this event: ${selectedEvent.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!selectedEvent) {
    return null;
  }

  if (loading && !eventDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !eventDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <ErrorMessage message={error} onRetry={loadEventDetails} />
      </div>
    );
  }

  const event = eventDetails || selectedEvent;
  const hasTickets = eventTickets && eventTickets.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("events")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Events</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Event Image */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Overlay with event type */}
        <div className="absolute top-4 left-4">
          <span
            className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${
              event.type === "online"
                ? "bg-purple-100 text-purple-800"
                : "bg-orange-100 text-orange-800"
            }
          `}
          >
            <Globe size={14} className="mr-1" />
            {event.type === "online" ? "Virtual Event" : "In-Person Event"}
          </span>
        </div>
      </div>

      {/* Event Info */}
      <div className="space-y-4">
        {/* Title and Category */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          {event.category && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Tag size={16} />
              <span>{event.category.name || event.category}</span>
            </div>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Date & Time */}
          <div className="flex items-start space-x-3">
            <Calendar size={20} className="text-primary-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Date & Time</p>
              <p className="text-gray-600">{formatDate(event.start_time)}</p>
              <p className="text-gray-600">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.address && (
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="text-primary-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-gray-600">{event.address}</p>
              </div>
            </div>
          )}

          {/* Organizer */}
          {event.organization && (
            <div className="flex items-start space-x-3">
              <Users size={20} className="text-primary-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Organized by</p>
                <p className="text-gray-600">
                  {event.organization.name || event.organization}
                </p>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-start space-x-3">
            <Clock size={20} className="text-primary-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Duration</p>
              <p className="text-gray-600">
                {Math.ceil(
                  (new Date(event.end_time) - new Date(event.start_time)) /
                    (1000 * 60 * 60)
                )}{" "}
                hours
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              About This Event
            </h3>
            <div
              className="text-gray-600 prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: event.description.replace(/&nbsp;/g, " "),
              }}
            />
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {event.gallery && event.gallery.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {event.gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Tickets Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6">
        {hasTickets ? (
          <button
            onClick={handleBookTickets}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Book Tickets
          </button>
        ) : (
          <div className="text-center text-gray-500">
            <p>Tickets are not available for this event</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
