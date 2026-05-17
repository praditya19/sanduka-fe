import React from 'react'

const Pagination = () => {
    return ( <div className="p-4 border-t">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => handlePageClick(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                          </svg>
                          First
                        </button>
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          Prev
                        </button>
    
                        {getVisiblePages().map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`px-3 py-1 border rounded-md text-sm ${page === currentPage
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white hover:bg-gray-50"
                              }`}
                          >
                            {page}
                          </button>
                        ))}
    
                        {totalPages > 3 && currentPage < totalPages - 3 && (
                          <span className="px-2 py-1">...</span>
                        )}
    
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                        >
                          Next
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handlePageClick(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center"
                        >
                          Last
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div> );
}
 
export default Pagination;