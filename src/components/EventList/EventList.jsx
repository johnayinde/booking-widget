import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, Search, Filter } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { apiService } from "../../services/api";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

const EventList = () => {
  const {
    events,
    categories,
    loading,
    error,
    setEvents,
    setCategories,
    setLoading,
    setError,
    clearError,
    selectEvent,
  } = useBooking();

  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    search_date: "",
  });

  const [filteredEvents, setFilteredEvents] = useState([]);

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  // Filter events when filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    setLoading(true);
    clearError();

    try {
      const result = await apiService.getEvents(filters);
      console.log(result);

      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await apiService.getEventCategories();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category_id) {
      filtered = filtered.filter(
        (event) => event.category_id?.toString() === filters.category_id
      );
    }

    // Date filter
    if (filters.search_date) {
      const filterDate = new Date(filters.search_date);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start_time);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleEventSelect = (event) => {
    selectEvent(event);
  };

  const handleRetry = () => {
    loadEvents();
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Discover Amazing Events
        </h2>
        <p className="text-gray-600">
          Find and book tickets for the best events in your area
        </p>
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onSearch={loadEvents}
      />

      {/* Events Count */}
      {filteredEvents.length > 0 && (
        <div className="text-sm text-gray-600">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}{" "}
          found
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={() => handleEventSelect(event)}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() =>
                setFilters({ search: "", category_id: "", search_date: "" })
              }
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )
      )}

      {/* Loading overlay for refresh */}
      {loading && events.length > 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default EventList;
