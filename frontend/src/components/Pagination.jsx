function Pagination({ currentPage = 0, totalPages = 1, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <div className="pagination">
      <button className="btn btn-secondary" type="button" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`btn btn-ghost ${page === currentPage ? 'active' : ''}`}
          type="button"
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}

      <button
        className="btn btn-secondary"
        type="button"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

// Made with Bob
