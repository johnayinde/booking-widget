import React from "react";
import { BookingProvider } from "./context/BookingContext";
import BookingWidget from "./components/BookingWidget/BookingWidget";
import "./App.css";

function App() {
  // Default configuration - can be overridden via props or initialization
  const defaultConfig = {
    identifier: "ticketing",
    theme: "light",
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL || "https://your-api-domain.com/api",
    branding: {
      primaryColor: "#3b82f6",
      logoUrl: "",
      companyName: "Event Ticketing",
    },
  };

  return (
    <div className="App">
      <BookingProvider initialConfig={defaultConfig}>
        <BookingWidget />
      </BookingProvider>
    </div>
  );
}

export default App;
