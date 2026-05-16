import React, { useEffect } from "react";

function Modal({ children, onClose }) {
  // ESC key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose} // backdrop click closes modal
    >
      <div
        className="bg-white p-6 rounded w-[400px] relative"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button
          className="absolute top-2 right-2"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}

export default Modal;
