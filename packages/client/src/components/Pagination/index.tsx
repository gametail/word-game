import { SetStateAction } from "react";

interface IPagination {
  className?: string;
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<SetStateAction<number>>;
}
const Pagination: React.FC<IPagination> = ({
  className,
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagesNumbers = getPageNumbers(totalPages);

  function getPageNumbers(totalPages: number) {
    const numbers = [...Array(totalPages + 1).keys()].slice(1);
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return numbers;
    } else {
      const half = Math.floor(maxButtons / 2);
      let start = currentPage - half;
      let end = currentPage + half;

      const leftOutOfBounds = start <= 1;
      const rightOutOfBounds = end >= totalPages;

      if (leftOutOfBounds) {
        start = 2;
        end = start + maxButtons - 1;
      }
      if (rightOutOfBounds) {
        end = totalPages - 1;
        start = end - maxButtons + 1;
      }

      const result = numbers.slice(start - 1, end);
      if (!result.includes(totalPages)) result.push(totalPages);
      if (!result.includes(1)) result.unshift(1);
      return result;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <div className={` flex justify-center w-full btn-group ${className}`}>
      <button className="btn btn-md btn-square" onClick={prevPage}>
        «
      </button>

      {pagesNumbers.map((page, index) => {
        return (
          <button
            key={index}
            className={`btn btn-md btn-square ${
              page === currentPage ? "btn-primary" : ""
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        );
      })}

      <button className="btn btn-md btn-square" onClick={nextPage}>
        »
      </button>
    </div>
  );
};

export default Pagination;
