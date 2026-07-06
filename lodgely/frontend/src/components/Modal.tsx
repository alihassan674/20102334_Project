"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div ref={modalRef} className="w-full max-w-lg rounded-lg shadow-xl overflow-hidden border border-indigo-700" style={{ backgroundColor: "#1a1740" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-700">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
