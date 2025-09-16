# Event Booking Widget

A universal React-based event booking widget that can be embedded into any website to provide seamless event ticketing functionality.

## ✨ Features

- 🎫 **Event Browsing** - Browse and filter available events
- 🔍 **Event Details** - View comprehensive event information
- 🎟️ **Ticket Selection** - Select and customize ticket quantities
- 👤 **Customer Information** - Capture customer details
- 💳 **Payment Integration** - Secure booking and payment processing
- 📱 **Responsive Design** - Works on all device sizes
- 🎨 **Customizable Themes** - Brand colors and styling
- ⚡ **Fast Integration** - Simple script tag implementation
- 🔄 **Error Handling** - Robust error recovery and retry logic
- 🌐 **Multi-instance Support** - Multiple widgets on same page

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourcompany/event-booking-widget.git
cd event-booking-widget

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build:widget
```

### Development

```bash
# Start development server
npm start

# Build production widget
npm run build:widget

# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Integration Guide

### 1. Basic Integration

Add the widget script to your website:

```html
<!-- Include the widget script -->
<script src="https://your-cdn.com/event-booking-widget.min.js"></script>

<!-- Create trigger button -->
<button data-event-booking="ticketing">Book Event Tickets</button>
```

### 2. Custom Configuration

```html
<!-- Custom theme and branding -->
<button
  data-event-booking="ticketing"
  data-config='{"branding": {"primaryColor": "#059669", "companyName": "Your Company"}}'
>
  Book Tickets
</button>
```

### 3. Programmatic Usage

```javascript
// Initialize widget programmatically
const widget = EventBookingWidget.init({
  identifier: "ticketing",
  apiBaseUrl: "https://your-api.com/api",
  branding: {
    primaryColor: "#3b82f6",
    companyName: "Your Company",
  },
});

// Control widget lifecycle
widget.destroy(); // Close specific widget
EventBookingWidget.destroyAll(); // Close all widgets
```

### 4. React Integration

```jsx
import React from "react";

const BookingButton = () => {
  const openWidget = () => {
    window.EventBookingWidget?.init({
      identifier: "ticketing",
      branding: { primaryColor: "#059669" },
    });
  };

  return <button onClick={openWidget}>Book Event Tickets</button>;
};
```

## 🔧 API Integration

### Required API Endpoints

The widget integrates with your existing event management API:

```
GET /lca/events/list                 # Get events list
GET /lca/events/detail/{id}          # Get event details
GET /lca/events/seat-tickets/{id}    # Get event tickets
GET /lca/events/categories           # Get event categories
POST /lca/create-booking             # Create booking
```

### API Configuration

```javascript
// Configure API endpoints
EventBookingWidget.configure({
  apiBaseUrl: "https://your-api-domain.com/api",
  // ... other config
});
```

### Request/Response Format

**Events List Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Event Name",
      "description": "Event description",
      "start_time": "2024-01-01T10:00:00",
      "end_time": "2024-01-01T18:00:00",
      "address": "Event location",
      "category": { "id": 1, "name": "Music" },
      "total_ticket": 100,
      "available_ticket": 50
    }
  ]
}
```

**Create Booking Request:**

```json
{
  "event_id": 1,
  "customer_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "selected_tickets": [
    {
      "id": 1,
      "name": "General Admission",
      "price": 50,
      "count": 2,
      "type": "paid"
    }
  ],
  "payment_type": "online",
  "total_amount": 100
}
```

## 🏗️ Component Architecture

```
src/
├── components/
│   ├── EventList/           # Event listing and filters
│   │   ├── EventList.jsx
│   │   ├── EventCard.jsx
│   │   └── EventFilters.jsx
│   ├── EventDetails/        # Event details view
│   │   └── EventDetails.jsx
│   ├── TicketSelection/     # Ticket selection
│   │   └── TicketSelection.jsx
│   ├── BookingForm/         # Customer information
│   │   └── BookingForm.jsx
│   ├── PaymentSuccess/      # Confirmation page
│   │   └── PaymentSuccess.jsx
│   ├── BookingWidget/       # Main widget container
│   │   └── BookingWidget.jsx
│   └── common/              # Shared components
│       ├── LoadingSpinner.jsx
│       ├── ErrorMessage.jsx
│       ├── Modal.jsx
│       └── Button.jsx
├── context/
│   └── BookingContext.js    # State management
├── services/
│   └── api.js              # API service layer
├── widget.js               # Widget entry point
└── App.js                  # Development app
```

## 🎨 Styling & Customization

### CSS Custom Properties

The widget supports CSS custom properties for advanced styling:

```css
:root {
  --ebw-primary-color: #3b82f6;
  --ebw-primary-hover: #2563eb;
  --ebw-border-radius: 8px;
  --ebw-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

### Tailwind CSS Classes

The widget uses Tailwind CSS internally. You can override styles:

```css
/* Override modal styles */
.ebw-modal {
  border-radius: 16px !important;
}

/* Override button styles */
.ebw-button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

## 🚀 Deployment

### CDN Deployment

1. **Build the widget:**

   ```bash
   npm run build:widget
   ```

2. **Upload to CDN:**
   Upload `dist/event-booking-widget.min.js` to your CDN

3. **Integration:**
   ```html
   <script src="https://your-cdn.com/event-booking-widget.min.js"></script>
   <button data-event-booking="ticketing">Book Tickets</button>
   ```

### Self-Hosted Deployment

1. **Build and serve:**

   ```bash
   npm run build:widget
   # Serve dist/ directory from your web server
   ```

2. **Integration:**
   ```html
   <script src="/path/to/event-booking-widget.min.js"></script>
   ```

### Docker Deployment

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Error Handling

The widget includes comprehensive error handling:

### Network Errors

- Automatic retry with exponential backoff
- Offline state detection
- Graceful degradation

### API Errors

- HTTP status code handling
- Validation error display
- User-friendly error messages

### Custom Error Handling

```javascript
// Configure custom error handling
EventBookingWidget.configure({
  onError: (error) => {
    console.error("Widget error:", error);
    // Custom error reporting
  },
});
```

## 📊 Analytics & Tracking

### Built-in Events

The widget emits custom events for tracking:

```javascript
// Listen for widget events
window.addEventListener("ebw:widget-opened", (event) => {
  gtag("event", "widget_opened", {
    widget_id: event.detail.widgetId,
  });
});

window.addEventListener("ebw:booking-completed", (event) => {
  gtag("event", "booking_completed", {
    booking_reference: event.detail.bookingReference,
    total_amount: event.detail.totalAmount,
  });
});
```

### Available Events

- `ebw:widget-opened` - Widget instance opened
- `ebw:widget-closed` - Widget instance closed
- `ebw:event-selected` - Event selected
- `ebw:tickets-selected` - Tickets selected
- `ebw:booking-started` - Booking form started
- `ebw:booking-completed` - Booking completed
- `ebw:payment-completed` - Payment completed
- `ebw:error` - Error occurred

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Integration Testing

```bash
# Start test server
npm start

# Open integration tests
open http://localhost:3000/tests
```

### Manual Testing

Use the provided examples:

```bash
# Build widget
npm run build:widget

# Open examples
open dist/examples/basic-integration.html
open dist/examples/advanced-integration.html
```

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: 12+
- **Chrome Mobile**: 60+

### Polyfills

For older browsers, include polyfills:

```html
<!-- For IE11 support -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,array-includes,promise,fetch"></script>
<script src="event-booking-widget.min.js"></script>
```

## 🔧 Advanced Configuration

### Multiple Widget Types

```javascript
// Configure different widget types
EventBookingWidget.configure({
  widgets: {
    ticketing: {
      branding: { primaryColor: "#3b82f6" },
      features: ["events", "tickets", "booking"],
    },
    hotel: {
      branding: { primaryColor: "#059669" },
      features: ["rooms", "dates", "booking"],
    },
  },
});

// Use specific widget type
EventBookingWidget.init({ identifier: "hotel" });
```

### Custom API Endpoints

```javascript
EventBookingWidget.configure({
  endpoints: {
    events: "/custom/events",
    booking: "/custom/booking",
    categories: "/custom/categories",
  },
});
```

### Internationalization

```javascript
EventBookingWidget.configure({
  locale: "en-US",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
});
```

## 🛠️ Development

### Local Development

```bash
# Start development server
npm start

# Start with specific API
REACT_APP_API_BASE_URL=http://localhost:8000/api npm start
```

### Building Components

```bash
# Watch mode for development
npm run build:widget -- --watch

# Production build
npm run build:widget
```

### Debugging

```bash
# Enable debug mode
REACT_APP_DEBUG=true npm start

# View widget logs
EventBookingWidget.configure({ debug: true });
```

## 🤝 Contributing

### Development Setup

1. **Fork and clone:**

   ```bash
   git clone https://github.com/yourcompany/event-booking-widget.git
   cd event-booking-widget
   npm install
   ```

2. **Create branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test:**

   ```bash
   npm start
   npm test
   npm run lint
   ```

4. **Submit PR:**
   ```bash
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### Code Standards

- **ESLint**: Follow React/ES6+ standards
- **Prettier**: Auto-format code
- **Conventional Commits**: Use semantic commit messages
- **Testing**: Add tests for new features

## 📈 Performance

### Bundle Size

- **Minified**: ~150KB
- **Gzipped**: ~45KB
- **Tree-shakeable**: Yes

### Optimization Features

- **Code splitting**: Lazy load components
- **Asset optimization**: Optimized images and fonts
- **Caching**: Browser and CDN caching
- **Preloading**: Critical resources preloaded

## 🔒 Security

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self' https://your-cdn.com; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://your-api.com;"
/>
```

### Data Protection

- **No sensitive data**: Stored in widget
- **HTTPS only**: All API communications
- **Token expiration**: Short-lived tokens
- **Input validation**: Client and server-side

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

### Documentation

- **API Docs**: https://docs.yourcompany.com/api
- **Widget Docs**: https://docs.yourcompany.com/widget
- **Examples**: https://examples.yourcompany.com

### Community

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: https://discord.gg/yourcompany
- **Stack Overflow**: Tag with `event-booking-widget`

### Commercial Support

- **Email**: support@yourcompany.com
- **Phone**: +1-800-SUPPORT
- **Enterprise**: enterprise@yourcompany.com

---

**Made with ❤️ by [Your Company](https://yourcompany.com)**# Event Booking Widget

A universal React-based event booking widget that can be embedded into any website to provide seamless event ticketing functionality.

## Features

- 🎫 **Event Browsing** - Browse and filter available events
- 🔍 **Event Details** - View comprehensive event information
- 🎟️ **Ticket Selection** - Select and customize ticket quantities
- 👤 **Customer Information** - Capture customer details
- 💳 **Payment Integration** - Secure booking and payment processing
- 📱 **Responsive Design** - Works on all device sizes
- 🎨 **Customizable Themes** - Brand colors and styling
- ⚡ **Fast Integration** - Simple script tag implementation

## Quick Start

### Installation

```bash
npm install
npm start
```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build widget bundle
npm run build:widget
```

## Integration Guide

### Basic Integration

Add the widget script to your website and create trigger elements:

```html
<!-- Include the widget script -->
<script src="https://your-cdn.com/event-booking-widget.js"></script>

<!-- Create trigger button -->
<button data-event-booking="ticketing">Book Event Tickets</button>
```

### Advanced Integration

```html
<!-- Custom configuration -->
<button
  data-event-booking="ticketing"
  data-config='{"theme": "dark", "branding": {"primaryColor": "#059669"}}'
>
  Book Tickets
</button>

<!-- Programmatic initialization -->
<script>
  EventBookingWidget.init({
    identifier: "ticketing",
    theme: "light",
    branding: {
      primaryColor: "#3b82f6",
      companyName: "Your Company",
    },
  });
</script>
```

## API Integration

The widget integrates with your existing event management API. Configure the following endpoints:

### Required API Endpoints

```
GET /lca/events/list - Get events list
GET /lca/events/detail/{id} - Get event details
GET /lca/events/seat-tickets/{id} - Get event tickets
GET /lca/events/categories - Get event categories
POST /lca/create-booking - Create booking
```

### API Configuration

```javascript
// Set API base URL
const config = {
  apiBaseUrl: "https://your-api-domain.com/api",
  // ... other config
};
```

## Component Architecture

### Core Components

```
src/
├── components/
│   ├── EventList/           # Event listing and filters
│   │   ├── EventList.jsx
│   │   ├── EventCard.jsx
│   │   └── EventFilters.jsx
│   ├── EventDetails/        # Event details view
│   │   └── EventDetails.jsx
│   ├── TicketSelection/     # Ticket selection
│   │   └── TicketSelection.jsx
│   ├── BookingForm/         # Customer information
│   │   └── BookingForm.jsx
│   ├── PaymentSuccess/      # Confirmation page
│   │   └── PaymentSuccess.jsx
│   ├── BookingWidget/       # Main widget container
│   │   └── BookingWidget.jsx
│   └── common/              # Shared components
│       ├── LoadingSpinner.jsx
│       ├── ErrorMessage.jsx
│       ├── Modal.jsx
│       └── Button.jsx
├── context/
│   └── BookingContext.js    # State management
├── services/
│   └── api.js              # API service layer
└── App.js                  # Main application
```

### State Management

The widget uses React Context for state management:

```javascript
// Access booking state
const {
  events,
  selectedEvent,
  selectedTickets,
  totalAmount,
  // ... actions
} = useBooking();
```

## Configuration Options

### Widget Configuration

```javascript
const config = {
  identifier: "ticketing", // Widget type identifier
  theme: "light", // Theme: 'light' | 'dark'
  apiBaseUrl: "https://api.com", // API base URL
  branding: {
    primaryColor: "#3b82f6", // Primary brand color
    logoUrl: "https://logo.png", // Company logo
    companyName: "Your Company", // Company name
  },
};
```

### Styling Customization

The widget uses Tailwind CSS and supports custom CSS variables:

```css
:root {
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
}
```

## API Integration Details

### Event Data Structure

```javascript
// Event object structure
{
  id: 1,
  name: "Event Name",
  description: "Event description",
  start_time: "2024-01-01T10:00:00",
  end_time: "2024-01-01T18:00:00",
  address: "Event location",
  image: "event-image.jpg",
  category: { id: 1, name: "Category" },
  type: "offline", // 'online' | 'offline'
  total_ticket: 100,
  available_ticket: 50
}
```

### Booking Data Structure

```javascript
// Booking request structure
{
  event_id: 1,
  customer_info: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  selected_tickets: [
    {
      id: 1,
      name: "General Admission",
      price: 50,
      count: 2,
      type: "paid"
    }
  ],
  payment_type: "online",
  total_amount: 100
}
```

## Deployment

### Production Build

```bash
# Build optimized bundle
npm run build

# Deploy to your CDN
# Upload build/static/js/*.js to your CDN
```

### CDN Integration

```html
<!-- Production usage -->
<script src="https://your-cdn.com/event-booking-widget.min.js"></script>
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For technical support or questions:

- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com
- Issues: https://github.com/yourcompany/event-booking-widget/issues
