import React from "react";
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPaginate: (pageNumber: number) => void;
}

const PaginationDashboard: React.FC<PaginationProps> = ({ currentPage, totalPages, onPaginate }) => {
  const { t } = useTranslation(); // Hook pour les traductions
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPaginate(currentPage - 1)}
      >
        {t("admin.prev")}
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={currentPage === index + 1 ? "active" : ""}
          onClick={() => onPaginate(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPaginate(currentPage + 1)}
      >
        {t("admin.suiv")}
      </button>
    </div>
  );
};

export default PaginationDashboard;
