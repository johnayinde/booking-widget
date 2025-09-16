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