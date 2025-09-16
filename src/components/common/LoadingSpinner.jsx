import React from "react";

const LoadingSpinner = ({ size = "md", className = "", color = "primary" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "border-primary-600",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div
        className={`
        animate-spin rounded-full border-2 border-gray-300 
        border-t-${colorClasses[color] || "border-primary-600"} 
        w-full h-full
      `}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
