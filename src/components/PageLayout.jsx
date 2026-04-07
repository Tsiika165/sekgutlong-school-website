import React from "react";

const PageLayout = ({ title, subtitle, children, action }) => {
  return (
    <div className="bg-stone-50 min-h-screen">
      {/* 🔝 HEADER (More compact) */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-bold text-amber-900 mb-1">
                {title}
              </h1>

              {subtitle && <p className="text-sm text-amber-700">{subtitle}</p>}

              <div className="mt-2 w-10 h-1 bg-amber-600 rounded-full"></div>
            </div>

            {/* RIGHT */}
            {action && <div>{action}</div>}
          </div>
        </div>
      </div>

      {/* 📄 CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
