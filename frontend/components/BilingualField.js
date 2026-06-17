"use client";

import React from "react";

export default function BilingualField({
  label,
  value = {},
  onChange,
  type = "text",
  placeholder,
  rows,
}) {
  const handleEnChange = (val) => {
    onChange({ ...(value || {}), en: val });
  };
  const handleAzChange = (val) => {
    onChange({ ...(value || {}), az: val });
  };

  const inputClass =
    "w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-sm focus:outline-none focus:border-emerald-800";
  const textareaClass =
    "w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-sm focus:outline-none focus:border-emerald-800";

  const enValue = typeof value === "object" && value !== null ? value.en ?? "" : value ?? "";
  const azValue = typeof value === "object" && value !== null ? value.az ?? "" : "";

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold uppercase text-emerald-955/50 mb-1">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/60 mb-1 block">
            EN
          </span>
          {type === "textarea" ? (
            <textarea
              rows={rows || 2}
              value={enValue}
              onChange={(e) => handleEnChange(e.target.value)}
              placeholder={placeholder}
              className={textareaClass}
            />
          ) : (
            <input
              type={type}
              value={enValue}
              onChange={(e) => handleEnChange(e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          )}
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60 mb-1 block">
            AZ
          </span>
          {type === "textarea" ? (
            <textarea
              rows={rows || 2}
              value={azValue}
              onChange={(e) => handleAzChange(e.target.value)}
              placeholder={placeholder}
              className={textareaClass}
            />
          ) : (
            <input
              type={type}
              value={azValue}
              onChange={(e) => handleAzChange(e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}
