"use client";

import React, { useEffect } from "react";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

/**
 * Shared accessible modal wrapper with Esc-to-close, backdrop click dismissal,
 * ARIA dialog semantics, and body scroll lock.
 */
export default function AccessibleModal({
  isOpen,
  onClose,
  ariaLabel,
  maxWidthClass = "max-w-3xl",
  children,
}: AccessibleModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        className={`bg-white border border-[#E5E0D8] rounded-3xl ${maxWidthClass} w-full p-6 sm:p-8 shadow-2xl max-h-[88vh] overflow-y-auto space-y-5`}
      >
        {children}
      </div>
    </div>
  );
}
