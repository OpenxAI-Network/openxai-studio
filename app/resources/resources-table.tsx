// app/resources/resources-table.tsx

'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { type Provider } from '@/db/schema';
import { prefix } from '@/utils/prefix';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import type { Column, Row, Table as TableType } from '@tanstack/react-table';
import { useDebounce } from '@uidotdev/usehooks';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Create the column definitions for the new DataTable.
const columns: ColumnDef<Provider>[] = [
  {
    accessorKey: 'providerName',
    header: 'Provider',
  },
  {
    accessorKey: 'location',
    header: 'Region',
    cell: ({ cell }) => cell.getValue() || '-',
  },
  {
    accessorKey: 'productName',
    header: 'Item',
  },
  {
    accessorKey: 'cpuCores',
    header: ({ column }) => {
      return <SortableHeaderButton column={column} label="CPU" />;
    },
    cell: ({ row }) => {
      return formatCpuInfo(row);
    },
  },
  {
    accessorKey: 'storageTotal',
    header: ({ column }) => {
      return <SortableHeaderButton column={column} label="Storage" />;
    },
    cell: ({ cell }) => {
      if (!cell.getValue()) return '-';
      return formatStorageSize(cell.getValue() as number);
    },
  },
  {
    accessorKey: 'gpuType',
    header: ({ column }) => {
      return <SortableHeaderButton column={column} label="GPU" />;
    },
    cell: ({ row }) =>
      row.original.gpuType ? `${row.original.gpuType} ${row.original.gpuMemory}` : '-',
  },
  {
    accessorKey: 'priceHour',
    header: ({ column }) => {
      return <SortableHeaderButton column={column} label="Price" />;
    },
    cell: ({ cell }) => (cell.getValue() ? `${formatPrice(cell.getValue() as number)}/h` : '-'),
  },
];

function formatCpuInfo(row: Row<Provider>): string {
  const { cpuCores, cpuThreads, cpuGHZ } = row.original;
  const parts: string[] = [];

  if (cpuCores != null) {
    parts.push(`${cpuCores}C`);
  }
  if (cpuThreads != null) {
    parts.push(`${cpuThreads}T`);
  }
  if (cpuGHZ != null) {
    parts.push(`${cpuGHZ}GHz`);
  }

  return parts.length > 0 ? parts.join(' / ') : '-';
}

function formatStorageSize(sizeInGb: number): string {
  if (sizeInGb >= 1024) {
    const sizeInTb = sizeInGb / 1000;
    return `${Math.round(sizeInTb)} TB`;
  } else {
    return `${sizeInGb} GB`;
  }
}

type ResourcesTableProps = {
  onSearchChange?: Dispatch<SetStateAction<string>>; // Made optional to handle undefined cases
  onFiltersChange?: Dispatch<SetStateAction<{
    provider: string;
    minStorage: number;
    minRAM: number;
    minGPUs: number;
    minBandwidth: number;
    minPrice?: number;
    maxPrice?: number;
  }>>; // Made optional to handle undefined cases
};

export default function ResourcesTable({ onSearchChange, onFiltersChange }: ResourcesTableProps) {
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState<string>();
  const [filters, setFilters] = useState({
    provider: '',
    minStorage: 0,
    minRAM: 0,
    minGPUs: 0,
    minBandwidth: 0,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['resources', page, debouncedSearchInput, sorting, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(pageSize));
      if (debouncedSearchInput) {
        params.append('q', debouncedSearchInput);
      }
      if (filters.provider) {
        params.append('r', filters.provider);
      }
      if (filters.minPrice !== undefined) {
        params.append('min', String(filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        params.append('max', String(filters.maxPrice));
      }
      if (filters.minRAM !== undefined) {
        params.append('minRAM', String(filters.minRAM));
      }
      if (filters.minStorage !== undefined) {
        params.append('minStorage', String(filters.minStorage));
      }
      if (sorting.length) {
        const sort = sorting[0];
        params.append('sort', sort.id);
        params.append('order', sort.desc ? 'desc' : 'asc');
      }

      const res = await fetch(`${prefix}/api/providers?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json() as Promise<{
        data: Provider[];
        totalPages: number;
      }>;
    },
    placeholderData: keepPreviousData,
  });

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Sync search input with onSearchChange prop, safely handle undefined
  useEffect(() => {
    if (onSearchChange && typeof onSearchChange === 'function') {
      console.log('Calling onSearchChange with:', searchInput || ''); // Debugging
      onSearchChange(searchInput || '');
    } else {
      console.warn('onSearchChange is not a function or is undefined');
    }
  }, [searchInput, onSearchChange]);

  // Sync filters with onFiltersChange prop, safely handle undefined
  useEffect(() => {
    if (onFiltersChange && typeof onFiltersChange === 'function') {
      console.log('Calling onFiltersChange with:', filters); // Debugging
      onFiltersChange(filters);
    } else {
      console.warn('onFiltersChange is not a function or is undefined');
    }
  }, [filters, onFiltersChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex max-w-96 items-center">
        <Search className="absolute left-3 size-4" />
        <Input
          type="text"
          placeholder="Filter provider and item names"
          value={searchInput || ''}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length} className="text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="h-12 border-none odd:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="pl-4" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={data?.totalPages ?? 0}
      />
    </div>
  );
}

function SortableHeaderButton({
  column,
  label,
}: {
  column: Column<Provider>;
  label: string;
}) {
  return (
    <Button
      className="-ml-3"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      {column.getIsSorted() === 'asc' ? (
        <ChevronUp className="ml-2 size-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ChevronDown className="ml-2 size-4" />
      ) : (
        <ChevronsUpDown className="ml-2 size-4" />
      )}
    </Button>
  );
}

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

function DataTablePagination<TData>({
  table,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="bottom">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page + 1} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="size-8 p-0 lg:flex"
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0 lg:flex"
            onClick={() => setPage(totalPages - 1)}
            disabled={page === totalPages - 1}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}