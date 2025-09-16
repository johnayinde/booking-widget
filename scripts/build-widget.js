#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Building Event Booking Widget...\n");

// Set environment variables
process.env.NODE_ENV = "production";
process.env.GENERATE_SOURCEMAP = "false";

try {
  // Clean previous build
  console.log("🧹 Cleaning previous build...");
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }
  fs.mkdirSync("dist", { recursive: true });

  // Build widget using webpack
  console.log("📦 Building widget bundle...");
  execSync("npx webpack --mode=production", {
    stdio: "inherit",
    env: { ...process.env },
  });

  // Generate integration examples
  console.log("📄 Generating integration examples...");
  generateIntegrationExamples();

  // Generate deployment files
  console.log("🚀 Generating deployment files...");
  generateDeploymentFiles();

  // Show build results
  console.log("\n✅ Widget build completed successfully!");
  showBuildResults();
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

function generateIntegrationExamples() {
  const examplesDir = path.join("dist", "examples");
  fs.mkdirSync(examplesDir, { recursive: true });

  // Basic integration example
  const basicExample = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Booking Widget - Basic Integration</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .demo-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .btn { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 10px 5px; }
        .btn:hover { background: #2563eb; }
        .code { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Event Booking Widget Integration Examples</h1>
    
    <div class="demo-section">
        <h3>1. Basic Button Integration</h3>
        <button data-event-booking="ticketing" class="btn">
            Book Event Tickets
        </button>
        
        <div class="code">
            <strong>HTML:</strong><br>
            &lt;script src="event-booking-widget.min.js"&gt;&lt;/script&gt;<br>
            &lt;button data-event-booking="ticketing"&gt;Book Event Tickets&lt;/button&gt;
        </div>
    </div>

    <div class="demo-section">
        <h3>2. Custom Theme Integration</h3>
        <button 
            data-event-booking="ticketing" 
            data-config='{"branding": {"primaryColor": "#059669"}}' 
            class="btn" style="background: #059669;"
        >
            Book with Green Theme
        </button>
        
        <div class="code">
            <strong>HTML:</strong><br>
            &lt;button data-event-booking="ticketing" data-config='{"branding": {"primaryColor": "#059669"}}'&gt;<br>
            &nbsp;&nbsp;Book with Green Theme<br>
            &lt;/button&gt;
        </div>
    </div>

    <div class="demo-section">
        <h3>3. Programmatic Integration</h3>
        <button onclick="openCustomWidget()" class="btn" style="background: #dc2626;">
            Open Custom Widget
        </button>
        
        <div class="code">
            <strong>JavaScript:</strong><br>
            function openCustomWidget() {<br>
            &nbsp;&nbsp;EventBookingWidget.init({<br>
            &nbsp;&nbsp;&nbsp;&nbsp;identifier: 'ticketing',<br>
            &nbsp;&nbsp;&nbsp;&nbsp;branding: { primaryColor: '#dc2626' }<br>
            &nbsp;&nbsp;});<br>
            }
        </div>
    </div>

    <!-- Widget Script -->
    <script src="../event-booking-widget.min.js"></script>
    
    <script>
        function openCustomWidget() {
            EventBookingWidget.init({
                identifier: 'ticketing',
                apiBaseUrl: 'http://127.0.0.1:8000/api',
                branding: { primaryColor: '#dc2626' }
            });
        }
        
        console.log('Event Booking Widget loaded successfully!');
        console.log('Available methods:', Object.keys(EventBookingWidget));
    </script>
</body>
</html>
  `.trim();

  fs.writeFileSync(
    path.join(examplesDir, "basic-integration.html"),
    basicExample
  );

  // Advanced integration example
  const advancedExample = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Booking Widget - Advanced Integration</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 40px; border-radius: 12px; margin-bottom: 40px; text-align: center; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 40px 0; }
        .feature { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn { padding: 15px 30px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s; }
        .btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.2); }
        .btn-secondary { background: #6b7280; }
        .btn-secondary:hover { background: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Event Booking Widget</h1>
            <p>Seamless ticket booking experience for any website</p>
            <button data-event-booking="ticketing" class="btn" style="font-size: 18px; padding: 18px 36px; margin-top: 20px;">
                🎫 Book Event Tickets
            </button>
        </div>

        <div class="features">
            <div class="feature">
                <h3>🎨 Custom Branding</h3>
                <p>Match your brand colors and styling perfectly.</p>
                <button 
                    data-event-booking="ticketing" 
                    data-config='{"branding": {"primaryColor": "#8b5cf6"}}' 
                    class="btn" style="background: #8b5cf6;"
                >
                    Purple Theme
                </button>
            </div>

            <div class="feature">
                <h3>⚡ Fast Integration</h3>
                <p>Add to any website with just one line of code.</p>
                <button 
                    data-event-booking="ticketing" 
                    data-config='{"branding": {"primaryColor": "#f59e0b"}}' 
                    class="btn" style="background: #f59e0b;"
                >
                    Orange Theme
                </button>
            </div>

            <div class="feature">
                <h3>📱 Mobile Responsive</h3>
                <p>Perfect experience on all devices and screen sizes.</p>
                <button 
                    data-event-booking="ticketing" 
                    data-config='{"branding": {"primaryColor": "#10b981"}}' 
                    class="btn" style="background: #10b981;"
                >
                    Green Theme
                </button>
            </div>
        </div>

        <div style="text-align: center; margin: 60px 0;">
            <h2>Programmatic Control</h2>
            <p>Full JavaScript API for advanced integrations</p>
            
            <button onclick="multipleWidgets()" class="btn btn-secondary">
                Open Multiple Widgets
            </button>
            
            <button onclick="destroyAllWidgets()" class="btn btn-secondary">
                Close All Widgets
            </button>
            
            <button onclick="showWidgetInfo()" class="btn btn-secondary">
                Show Widget Info
            </button>
        </div>
    </div>

    <!-- Widget Script -->
    <script src="../event-booking-widget.min.js"></script>
    
    <script>
        function multipleWidgets() {
            EventBookingWidget.init({
                identifier: 'ticketing',
                apiBaseUrl: 'http://127.0.0.1:8000/api',
                branding: { primaryColor: '#ef4444' }
            });
            
            setTimeout(() => {
                EventBookingWidget.init({
                    identifier: 'ticketing',
                    apiBaseUrl: 'http://127.0.0.1:8000/api',
                    branding: { primaryColor: '#06b6d4' }
                });
            }, 1000);
        }
        
        function destroyAllWidgets() {
            EventBookingWidget.destroyAll();
            alert('All widgets closed!');
        }
        
        function showWidgetInfo() {
            const instances = EventBookingWidget.getInstances();
            const config = EventBookingWidget.getConfig();
            
            alert(\`Active widgets: \${instances.length}\nGlobal config: \${JSON.stringify(config, null, 2)}\`);
        }
    </script>
</body>
</html>
  `.trim();

  fs.writeFileSync(
    path.join(examplesDir, "advanced-integration.html"),
    advancedExample
  );

  // React integration example
  const reactExample = `
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
  `.trim();

  fs.writeFileSync(
    path.join(examplesDir, "react-integration.jsx"),
    reactExample
  );
}

function generateDeploymentFiles() {
  // CDN deployment instructions
  const cdnInstructions = `
# CDN Deployment Instructions

## Files to Upload

Upload these files to your CDN:

1. \`event-booking-widget.min.js\` - Main widget bundle
2. \`event-booking-widget.min.css\` - Widget styles (if separate)

## CDN Integration

Add to your website's HTML:

\`\`\`html
<!-- Load the widget -->
<script src="https://your-cdn.com/event-booking-widget.min.js"></script>

<!-- Add booking buttons -->
<button data-event-booking="ticketing">Book Tickets</button>
\`\`\`

## Configuration

### Basic Usage
\`\`\`html
<button data-event-booking="ticketing">Book Event Tickets</button>
\`\`\`

### With Custom Theme
\`\`\`html
<button 
  data-event-booking="ticketing"
  data-config='{"branding": {"primaryColor": "#059669"}}'
>
  Book Tickets
</button>
\`\`\`

### Programmatic Usage
\`\`\`javascript
EventBookingWidget.init({
  identifier: 'ticketing',
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  branding: {
    primaryColor: '#3b82f6',
    companyName: 'Your Company'
  }
});
\`\`\`

## Environment Variables

Set these environment variables before building:

- \`REACT_APP_API_BASE_URL\` - Your API base URL
- \`REACT_APP_PRIMARY_COLOR\` - Default primary color
- \`REACT_APP_COMPANY_NAME\` - Default company name

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Bundle Size

- Main bundle: ~150KB gzipped
- Loads asynchronously, won't block page rendering
  `.trim();

  fs.writeFileSync(path.join("dist", "CDN-DEPLOYMENT.md"), cdnInstructions);

  // Package.json for npm publishing
  const packageJson = {
    name: "event-booking-widget",
    version: "1.0.0",
    description: "Universal event booking widget for websites",
    main: "event-booking-widget.min.js",
    module: "event-booking-widget.min.js",
    types: "types.d.ts",
    files: [
      "event-booking-widget.min.js",
      "event-booking-widget.min.css",
      "types.d.ts",
      "README.md",
    ],
    keywords: ["event", "booking", "widget", "tickets", "react"],
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/yourcompany/event-booking-widget",
    },
    homepage: "https://github.com/yourcompany/event-booking-widget#readme",
  };

  fs.writeFileSync(
    path.join("dist", "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // TypeScript definitions
  const typeDefinitions = `
declare global {
  interface Window {
    EventBookingWidget: EventBookingWidgetAPI;
  }
}

export interface BookingConfig {
  identifier?: string;
  apiBaseUrl?: string;
  theme?: 'light' | 'dark';
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    companyName?: string;
  };
}

export interface WidgetInstance {
  id: string;
  container: HTMLElement;
  config: BookingConfig;
  destroy: () => void;
}

export interface EventBookingWidgetAPI {
  init(config?: BookingConfig): WidgetInstance;
  destroy(widgetId: string): boolean;
  destroyAll(): void;
  getInstances(): WidgetInstance[];
  configure(config: BookingConfig): void;
  getConfig(): BookingConfig;
}

export declare const EventBookingWidget: EventBookingWidgetAPI;
export default EventBookingWidget;
  `.trim();

  fs.writeFileSync(path.join("dist", "types.d.ts"), typeDefinitions);
}

function showBuildResults() {
  const distPath = path.join(process.cwd(), "dist");
  const files = fs.readdirSync(distPath);

  console.log("\n📦 Generated files:");
  files.forEach((file) => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const size = (stats.size / 1024).toFixed(2);
      console.log(`  ${file} (${size} KB)`);
    } else {
      console.log(`  ${file}/ (directory)`);
    }
  });

  console.log("\n🚀 Ready for deployment!");
  console.log("📋 Next steps:");
  console.log("  1. Upload dist/event-booking-widget.min.js to your CDN");
  console.log("  2. Update API base URL in your configuration");
  console.log("  3. Test integration using examples/basic-integration.html");
  console.log("  4. Check CDN-DEPLOYMENT.md for deployment instructions");
}
