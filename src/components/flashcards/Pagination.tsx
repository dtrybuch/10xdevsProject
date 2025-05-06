import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(parseInt(value, 10));
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Rozmiar strony:
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
        >
          &lt;&lt;
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt;
        </Button>
        <span className="mx-2 text-sm">
          Strona {currentPage} z {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          &gt;&gt;
        </Button>
      </div>
    </div>
  );
} 