import React, { createContext, useContext, useReducer, useEffect } from "react";

// Initial state
const initialState = {
  // Widget config
  config: {
    identifier: "ticketing",
    theme: "light",
    apiBaseUrl: "",
    branding: {
      primaryColor: "#3b82f6",
      logoUrl: "",
      companyName: "Event Ticketing",
    },
  },

  // UI state
  isOpen: false,
  currentStep: "events", // events, details, tickets, booking, processing, payment
  loading: false,
  error: null,

  // Data state
  events: [],
  categories: [],
  selectedEvent: null,
  selectedTickets: [],
  customerInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },

  // Booking state
  bookingReference: null,
  totalAmount: 0,
  paymentStatus: "pending", // pending, processing, completed, failed
  paymentReference: null,
};

// Action types
const ActionTypes = {
  SET_CONFIG: "SET_CONFIG",
  TOGGLE_WIDGET: "TOGGLE_WIDGET",
  SET_STEP: "SET_STEP",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_EVENTS: "SET_EVENTS",
  SET_CATEGORIES: "SET_CATEGORIES",
  SELECT_EVENT: "SELECT_EVENT",
  UPDATE_SELECTED_TICKETS: "UPDATE_SELECTED_TICKETS",
  UPDATE_CUSTOMER_INFO: "UPDATE_CUSTOMER_INFO",
  SET_BOOKING_REFERENCE: "SET_BOOKING_REFERENCE",
  SET_PAYMENT_REFERENCE: "SET_PAYMENT_REFERENCE",
  SET_PAYMENT_STATUS: "SET_PAYMENT_STATUS",
  CALCULATE_TOTAL: "CALCULATE_TOTAL",
  RESET_BOOKING: "RESET_BOOKING",
};

// Reducer
function bookingReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case ActionTypes.TOGGLE_WIDGET:
      return {
        ...state,
        isOpen: !state.isOpen,
        currentStep: state.isOpen ? "events" : state.currentStep,
      };

    case ActionTypes.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
        error: null,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
      };

    case ActionTypes.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    case ActionTypes.SELECT_EVENT:
      return {
        ...state,
        selectedEvent: action.payload,
        selectedTickets: [], // Reset tickets when selecting new event
        currentStep: "details",
      };

    case ActionTypes.UPDATE_SELECTED_TICKETS:
      const updatedTickets = Array.isArray(state.selectedTickets)
        ? [...state.selectedTickets]
        : [];
      const ticketIndex = updatedTickets.findIndex(
        (t) => t.id === action.payload.id
      );

      if (ticketIndex >= 0) {
        if (action.payload.quantity === 0) {
          updatedTickets.splice(ticketIndex, 1);
        } else {
          updatedTickets[ticketIndex] = action.payload;
        }
      } else if (action.payload.quantity > 0) {
        updatedTickets.push(action.payload);
      }

      return {
        ...state,
        selectedTickets: updatedTickets,
      };

    case ActionTypes.UPDATE_CUSTOMER_INFO:
      return {
        ...state,
        customerInfo: { ...state.customerInfo, ...action.payload },
      };

    case ActionTypes.SET_BOOKING_REFERENCE:
      return {
        ...state,
        bookingReference: action.payload,
      };

    case ActionTypes.SET_PAYMENT_REFERENCE:
      return {
        ...state,
        paymentReference: action.payload,
      };

    case ActionTypes.SET_PAYMENT_STATUS:
      return {
        ...state,
        paymentStatus: action.payload,
      };

    case ActionTypes.CALCULATE_TOTAL:
      const ticketsArray = Array.isArray(state.selectedTickets)
        ? state.selectedTickets
        : [];
      const total = ticketsArray.reduce((sum, ticket) => {
        return sum + ticket.price * ticket.quantity;
      }, 0);

      return {
        ...state,
        totalAmount: total,
      };

    case ActionTypes.RESET_BOOKING:
      return {
        ...state,
        selectedEvent: null,
        selectedTickets: [],
        customerInfo: initialState.customerInfo,
        bookingReference: null,
        paymentReference: null,
        totalAmount: 0,
        paymentStatus: "pending",
        currentStep: "events",
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const BookingContext = createContext();

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

// Provider component
export const BookingProvider = ({ children, initialConfig = {} }) => {
  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialState,
    config: { ...initialState.config, ...initialConfig },
  });

  // Auto-calculate total when selected tickets change
  useEffect(() => {
    dispatch({ type: ActionTypes.CALCULATE_TOTAL });
  }, [state.selectedTickets]);

  // Actions
  const actions = {
    setConfig: (config) =>
      dispatch({ type: ActionTypes.SET_CONFIG, payload: config }),

    toggleWidget: () => dispatch({ type: ActionTypes.TOGGLE_WIDGET }),

    setStep: (step) => dispatch({ type: ActionTypes.SET_STEP, payload: step }),

    setLoading: (loading) =>
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),

    setError: (error) =>
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),

    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),

    setEvents: (events) =>
      dispatch({ type: ActionTypes.SET_EVENTS, payload: events }),

    setCategories: (categories) =>
      dispatch({ type: ActionTypes.SET_CATEGORIES, payload: categories }),

    selectEvent: (event) =>
      dispatch({ type: ActionTypes.SELECT_EVENT, payload: event }),

    updateSelectedTickets: (ticket) =>
      dispatch({ type: ActionTypes.UPDATE_SELECTED_TICKETS, payload: ticket }),

    updateCustomerInfo: (info) =>
      dispatch({ type: ActionTypes.UPDATE_CUSTOMER_INFO, payload: info }),

    setBookingReference: (reference) =>
      dispatch({ type: ActionTypes.SET_BOOKING_REFERENCE, payload: reference }),

    setPaymentReference: (reference) =>
      dispatch({ type: ActionTypes.SET_PAYMENT_REFERENCE, payload: reference }),

    setPaymentStatus: (status) =>
      dispatch({ type: ActionTypes.SET_PAYMENT_STATUS, payload: status }),

    resetBooking: () => dispatch({ type: ActionTypes.RESET_BOOKING }),
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
