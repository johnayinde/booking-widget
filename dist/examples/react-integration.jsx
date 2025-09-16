import React from 'react';

// Method 1: Script tag integration
const EventBookingButton = () => {
  return (
    <button 
      data-event-booking="ticketing"
      data-config='{"branding": {"primaryColor": "#3b82f6"}}'
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Book Event Tickets
    </button>
  );
};

// Method 2: Programmatic integration
const ProgrammaticWidget = () => {
  const openWidget = () => {
    if (window.EventBookingWidget) {
      window.EventBookingWidget.init({
        apiBaseUrl: 'http://127.0.0.1:8000/api',
        identifier: 'ticketing',
        branding: { primaryColor: '#059669' }
      });
    }
  };

  return (
    <button 
      onClick={openWidget}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
    >
      Open Booking Widget
    </button>
  );
};

export { EventBookingButton, ProgrammaticWidget };