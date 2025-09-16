import React from "react";
import { createRoot } from "react-dom/client";
import { BookingProvider } from "./context/BookingContext";
import BookingWidget from "./components/BookingWidget/BookingWidget";
import "./App.css";

// Widget API for external websites
class EventBookingWidgetAPI {
  constructor() {
    this.instances = new Map();
    this.globalConfig = {
      identifier: "ticketing", // Default identifier
      apiBaseUrl: "http://127.0.0.1:8000/api",
      theme: "light",
      branding: {
        primaryColor: "#3b82f6",
        companyName: "Event Ticketing",
      },
      autoShow: true, // Auto-show floating button
      position: "bottom-right", // bottom-right, bottom-left, top-right, top-left
    };
    this.autoInitialized = false;
  }

  // Initialize widget with configuration
  init(config = {}) {
    const widgetId = `ebw-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const mergedConfig = { ...this.globalConfig, ...config };

    // Create container
    const container = document.createElement("div");
    container.id = widgetId;
    container.style.cssText = "position: relative; z-index: 9999;";
    document.body.appendChild(container);

    // Create React root and render
    const root = createRoot(container);
    root.render(
      React.createElement(
        BookingProvider,
        { initialConfig: mergedConfig },
        React.createElement(BookingWidget)
      )
    );

    // Store instance
    const instance = {
      id: widgetId,
      container,
      root,
      config: mergedConfig,
      destroy: () => this.destroy(widgetId),
    };

    this.instances.set(widgetId, instance);
    return instance;
  }

  // Auto-initialize floating button
  autoInit(config = {}) {
    if (this.autoInitialized) {
      return;
    }

    const mergedConfig = { ...this.globalConfig, ...config, autoShow: true };
    this.autoInitialized = true;
    return this.init(mergedConfig);
  }

  // Destroy specific widget instance
  destroy(widgetId) {
    const instance = this.instances.get(widgetId);
    if (instance) {
      instance.root.unmount();
      if (instance.container.parentNode) {
        instance.container.parentNode.removeChild(instance.container);
      }
      this.instances.delete(widgetId);
      return true;
    }
    return false;
  }

  // Destroy all widget instances
  destroyAll() {
    this.instances.forEach((instance, widgetId) => {
      this.destroy(widgetId);
    });
  }

  // Get all active instances
  getInstances() {
    return Array.from(this.instances.values());
  }

  // Update global configuration
  configure(config) {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  // Get current configuration
  getConfig() {
    return { ...this.globalConfig };
  }

  // Hide floating button
  hide() {
    this.instances.forEach((instance) => {
      if (instance.container) {
        instance.container.style.display = "none";
      }
    });
  }

  // Show floating button
  show() {
    this.instances.forEach((instance) => {
      if (instance.container) {
        instance.container.style.display = "block";
      }
    });
  }
}

// Create global instance
const widgetAPI = new EventBookingWidgetAPI();

// Expose API globally
if (typeof window !== "undefined") {
  window.EventBookingWidget = widgetAPI;

  // Auto-initialize on DOM ready
  const initializeWidget = () => {
    // Check for explicit configuration
    const autoInitElement = document.querySelector("[data-ebw-auto-init]");
    const scriptTag = document.querySelector(
      'script[src*="event-booking-widget"]'
    );

    let autoConfig = {};

    // Get config from script tag attributes
    if (scriptTag) {
      const configAttrs = {};
      Array.from(scriptTag.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          const key = attr.name
            .replace("data-", "")
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          configAttrs[key] = attr.value;
        }
      });

      // Parse complex config
      if (configAttrs.config) {
        try {
          autoConfig = { ...autoConfig, ...JSON.parse(configAttrs.config) };
        } catch (e) {
          console.warn(
            "EventBookingWidget: Invalid config in script data-config"
          );
        }
      }

      // Simple attributes
      if (configAttrs.identifier)
        autoConfig.identifier = configAttrs.identifier;
      if (configAttrs.theme) autoConfig.theme = configAttrs.theme;
      if (configAttrs.primaryColor) {
        autoConfig.branding = {
          ...autoConfig.branding,
          primaryColor: configAttrs.primaryColor,
        };
      }
      if (configAttrs.companyName) {
        autoConfig.branding = {
          ...autoConfig.branding,
          companyName: configAttrs.companyName,
        };
      }
      if (configAttrs.position) autoConfig.position = configAttrs.position;
      if (configAttrs.autoShow === "false") autoConfig.autoShow = false;
    }

    // Auto-initialize unless explicitly disabled
    if (autoConfig.autoShow !== false) {
      widgetAPI.autoInit(autoConfig);
    }

    // Look for trigger elements with data attributes
    const triggers = document.querySelectorAll("[data-event-booking]");

    triggers.forEach((trigger) => {
      // Skip if already initialized
      if (trigger.hasAttribute("data-ebw-initialized")) {
        return;
      }

      const identifier = trigger.getAttribute("data-event-booking");
      const configAttr = trigger.getAttribute("data-config");

      let config = { identifier, autoShow: false }; // Don't auto-show for manual triggers

      // Parse config if provided
      if (configAttr) {
        try {
          config = { ...config, ...JSON.parse(configAttr) };
        } catch (e) {
          console.warn(
            "EventBookingWidget: Invalid config JSON in data-config attribute:",
            e
          );
        }
      }

      // Extract additional data attributes
      const dataAttributes = {};
      Array.from(trigger.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-ebw-")) {
          const key = attr.name
            .replace("data-ebw-", "")
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          dataAttributes[key] = attr.value;
        }
      });

      config = { ...config, ...dataAttributes };

      // Add click event listener
      const clickHandler = (e) => {
        e.preventDefault();
        widgetAPI.init(config);
      };

      trigger.addEventListener("click", clickHandler);
      trigger.setAttribute("data-ebw-initialized", "true");

      // Store cleanup function
      trigger._ebwCleanup = () => {
        trigger.removeEventListener("click", clickHandler);
        trigger.removeAttribute("data-ebw-initialized");
      };
    });
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWidget);
  } else {
    // DOM is already loaded
    setTimeout(initializeWidget, 100);
  }

  // Re-initialize when new content is added to the page
  const observer = new MutationObserver((mutations) => {
    let shouldReinitialize = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            if (node.hasAttribute && node.hasAttribute("data-event-booking")) {
              shouldReinitialize = true;
            } else if (
              node.querySelector &&
              node.querySelector("[data-event-booking]")
            ) {
              shouldReinitialize = true;
            }
          }
        });
      }
    });

    if (shouldReinitialize) {
      initializeWidget();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    widgetAPI.destroyAll();
    observer.disconnect();

    // Cleanup trigger event listeners
    document.querySelectorAll("[data-ebw-initialized]").forEach((trigger) => {
      if (trigger._ebwCleanup) {
        trigger._ebwCleanup();
      }
    });
  });
}

// Export for module systems
export default widgetAPI;

// CommonJS support
if (typeof module !== "undefined" && module.exports) {
  module.exports = widgetAPI;
}
