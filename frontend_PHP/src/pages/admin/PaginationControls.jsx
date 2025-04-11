// src/components/admin/PaginationControls.jsx (Ví dụ)
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(currentPage - 1);
    const handleNext = () => onPageChange(currentPage + 1);

    // Logic tạo dãy số trang (có thể phức tạp hơn cho nhiều trang)
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số lượng nút trang hiển thị tối đa
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

     if (totalPages > maxPagesToShow) {
        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        } else if (startPage === 1) {
             endPage = maxPagesToShow;
        }
    }


    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center mt-6 space-x-1">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-2.5"
            >
                 <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
             {startPage > 1 && (
                 <>
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)}>1</Button>
                     {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
                 </>
             )}
             {pageNumbers.map(num => (
                 <Button
                     key={num}
                     variant={currentPage === num ? 'default' : 'outline'}
                     size="icon"
                     className="h-8 w-8"
                     onClick={() => onPageChange(num)}
                 >
                    {num}
                </Button>
            ))}
              {endPage < totalPages && (
                 <>
                     {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
                 </>
             )}
            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                 className="px-2.5"
            >
                 Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
};

export default PaginationControls;