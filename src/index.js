import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Widget initialization function for external websites
window.EventBookingWidget = {
  init: (config = {}) => {
    // Create container for the widget
    const containerId = `event-booking-widget-${Date.now()}`;
    const container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);

    // Render the widget
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App config={config} />
      </React.StrictMode>
    );

    // Return methods to control the widget
    return {
      destroy: () => {
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      },
      container: container,
    };
  },
};

// Auto-initialize if script is loaded with data attributes
document.addEventListener("DOMContentLoaded", () => {
  // Look for trigger elements with data attributes
  const triggers = document.querySelectorAll("[data-event-booking]");

  triggers.forEach((trigger) => {
    const identifier = trigger.getAttribute("data-event-booking");
    const configAttr = trigger.getAttribute("data-config");

    let config = { identifier };

    // Parse config if provided
    if (configAttr) {
      try {
        config = { ...config, ...JSON.parse(configAttr) };
      } catch (e) {
        console.warn("Invalid config JSON in data-config attribute:", e);
      }
    }

    // Initialize widget on click
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      window.EventBookingWidget.init(config);
    });
  });

  // Auto-initialize if data-auto-init is present
  const autoInit = document.querySelector('[data-auto-init="event-booking"]');
  if (autoInit) {
    const configAttr = autoInit.getAttribute("data-config");
    let config = {};

    if (configAttr) {
      try {
        config = JSON.parse(configAttr);
      } catch (e) {
        console.warn("Invalid config JSON in data-config attribute:", e);
      }
    }

    window.EventBookingWidget.init(config);
  }
});

// For development mode
if (process.env.NODE_ENV === "development") {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
