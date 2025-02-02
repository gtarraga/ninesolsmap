import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useTranslations } from "next-intl";

const HelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={openModal}
        className="hover:border-black dark:hover:border-white border border-solid border-transparent text-gray-800  dark:text-white font-bold py-2 px-2 rounded inline-flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-circle-help"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </button>
    );
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#d6dbdc] dark:bg-gray-800 p-5 border-5 w-4/5 max-w-4xl relative z-2">
        <span
          className="absolute top-2.5 right-5 text-gray-400 text-3xl font-bold cursor-pointer hover:text-black dark:hover:text-white focus:text-white"
          onClick={closeModal}
        >
          &times;
        </span>

        <div className="p-4">
          <h1 className="text-3xl font-bold">{t("help-title")}</h1>
          <p className="mt-2 py-2">{t("help-1")}</p>

          <hr className="my-4 border-t border-gray-700" />
          <p className="mt-2 py-2">{t("help-2")}</p>
          <p className="mt-2">{t("help-3")}</p>
          {/* 
          <hr className="my-4 border-t border-gray-700" />
          <p className="mt-2 py-2">
            {t("help-suggestion")}{" "}
            <a href="https://docs.google.com/spreadsheets/d/1mWO0Kh3wYk_J9xQBLqgUTzylosoOkID6p-90iZOtTHY/edit?usp=sharing" className="text-emerald-600 dark:text-amber-400 hover:underline">
              {t("help-link")}
            </a>
          </p> */}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HelpModal;
