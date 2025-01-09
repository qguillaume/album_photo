import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPaginate: (pageNumber: number) => void;
}

const PaginationDashboard: React.FC<PaginationProps> = ({ currentPage, totalPages, onPaginate }) => {
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPaginate(currentPage - 1)}
      >
        Précédent
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
        Suivant
      </button>
    </div>
  );
};

export default PaginationDashboard;
