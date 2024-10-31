import React from "react";

interface PopUpModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const PopUpModal: React.FC<PopUpModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-bold">{title}</h2>
        <p>{message}</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PopUpModal;
