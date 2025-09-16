import React from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

const ErrorMessage = ({
  message,
  onRetry,
  className = "",
  type = "default",
  showIcon = true,
}) => {
  const getErrorConfig = () => {
    const configs = {
      network: {
        icon: WifiOff,
        title: "Connection Error",
        message: "Please check your internet connection and try again.",
        bgColor: "bg-orange-50",
        textColor: "text-orange-900",
        iconColor: "text-orange-400",
      },
      api: {
        icon: AlertCircle,
        title: "Service Unavailable",
        message:
          "Our service is temporarily unavailable. Please try again later.",
        bgColor: "bg-red-50",
        textColor: "text-red-900",
        iconColor: "text-red-400",
      },
      notFound: {
        icon: AlertCircle,
        title: "Not Found",
        message: "The requested resource could not be found.",
        bgColor: "bg-gray-50",
        textColor: "text-gray-900",
        iconColor: "text-gray-400",
      },
      default: {
        icon: AlertCircle,
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again.",
        bgColor: "bg-red-50",
        textColor: "text-red-900",
        iconColor: "text-red-400",
      },
    };

    return configs[type] || configs.default;
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <div className={`text-center py-8 ${className}`}>
      {showIcon && (
        <div className={`${config.iconColor} mb-4`}>
          <IconComponent size={48} className="mx-auto" />
        </div>
      )}

      <div className={`max-w-md mx-auto p-4 rounded-lg ${config.bgColor}`}>
        <h3 className={`text-lg font-medium ${config.textColor} mb-2`}>
          {config.title}
        </h3>
        <p className={`${config.textColor} opacity-80 mb-4`}>
          {message || config.message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
