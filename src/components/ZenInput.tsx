import React from "react";

interface ZenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ZenInput = React.memo(function ZenInput({
  className = "",
  ...props
}: ZenInputProps) {
  return (
    <input
      className={`w-full bg-slate-950 border border-slate-800 focus:border-amber-400/50 rounded-xl px-3 py-2 text-slate-200 focus:outline-none transition-colors text-xs ${className}`}
      {...props}
    />
  );
});

interface ZenTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const ZenTextarea = React.memo(function ZenTextarea({
  className = "",
  ...props
}: ZenTextareaProps) {
  return (
    <textarea
      className={`w-full bg-slate-950 border border-slate-800 focus:border-amber-400/50 rounded-xl px-3 py-2 text-slate-200 focus:outline-none resize-none transition-colors text-xs ${className}`}
      {...props}
    />
  );
});
