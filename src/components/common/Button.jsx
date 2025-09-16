import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 disabled:bg-primary-300",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 disabled:text-gray-400",
    success:
      "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-green-300",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300",
    warning:
      "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 disabled:bg-yellow-300",
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const isDisabled = disabled || loading;

  const buttonClasses = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? "w-full" : ""}
    ${isDisabled ? "opacity-50" : ""}
    ${className}
  `.trim();

  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size="sm" color="white" />;
    }
    return icon;
  };

  const renderContent = () => {
    if (loading && !children) {
      return <LoadingSpinner size="sm" color="white" />;
    }

    const iconElement = renderIcon();

    if (!iconElement) {
      return children;
    }

    if (iconPosition === "right") {
      return (
        <>
          {children}
          <span className="ml-2">{iconElement}</span>
        </>
      );
    }

    return (
      <>
        <span className="mr-2">{iconElement}</span>
        {children}
      </>
    );
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
