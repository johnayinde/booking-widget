# CDN Deployment Instructions

## Files to Upload

Upload these files to your CDN:

1. `event-booking-widget.min.js` - Main widget bundle
2. `event-booking-widget.min.css` - Widget styles (if separate)

## CDN Integration

Add to your website's HTML:

```html
<!-- Load the widget -->
<script src="https://your-cdn.com/event-booking-widget.min.js"></script>

<!-- Add booking buttons -->
<button data-event-booking="ticketing">Book Tickets</button>
```

## Configuration

### Basic Usage
```html
<button data-event-booking="ticketing">Book Event Tickets</button>
```

### With Custom Theme
```html
<button 
  data-event-booking="ticketing"
  data-config='{"branding": {"primaryColor": "#059669"}}'
>
  Book Tickets
</button>
```

### Programmatic Usage
```javascript
EventBookingWidget.init({
  identifier: 'ticketing',
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  branding: {
    primaryColor: '#3b82f6',
    companyName: 'Your Company'
  }
});
```

## Environment Variables

Set these environment variables before building:

- `REACT_APP_API_BASE_URL` - Your API base URL
- `REACT_APP_PRIMARY_COLOR` - Default primary color
- `REACT_APP_COMPANY_NAME` - Default company name

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Bundle Size

- Main bundle: ~150KB gzipped
- Loads asynchronously, won't block page rendering