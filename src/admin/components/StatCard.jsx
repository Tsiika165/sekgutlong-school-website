import React from "react";

const StatCard = (props) => {
  const {
    title,
    value,
    icon,
    color,
    subtitle,
    onClick,
    clickable = false,
  } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`bg-white rounded-2xl border border-amber-200 p-6 shadow-sm transition text-left w-full ${
        clickable
          ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-amber-950">{value}</h3>

          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
        </div>

        <div className={`${color} p-3 rounded-xl`}>
          {icon &&
            React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
        </div>
      </div>
    </button>
  );
};

export default StatCard;
