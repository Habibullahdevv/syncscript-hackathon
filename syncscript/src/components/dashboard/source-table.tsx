'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Source } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/utils';

interface SourceTableProps {
  sources: Source[];
  userRole: 'owner' | 'contributor' | 'viewer';
  onDelete?: (sourceId: string) => void;
}

/**
 * SourceTable component with TanStack Table
 * Features: sorting, filtering, pagination, role-based actions
 */
export function SourceTable({ sources, userRole, onDelete }: SourceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns
  const columns = useMemo<ColumnDef<Source>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('title')}</div>
        ),
      },
      {
        accessorKey: 'fileSize',
        header: 'File Size',
        cell: ({ row }) => formatBytes(row.getValue('fileSize')),
      },
      {
        accessorKey: 'createdAt',
        header: 'Upload Date',
        cell: ({ row }) => formatDate(row.getValue('createdAt')),
      },
      {
        accessorKey: 'uploadedBy',
        header: 'Uploaded By',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.getValue('uploadedBy')}
          </div>
        ),
      },
      ...(userRole === 'owner' && onDelete
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: any }) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete "${row.original.title}"?`
                      )
                    ) {
                      onDelete(row.original.id);
                    }
                  }}
                >
                  Delete
                </Button>
              ),
            } as ColumnDef<Source>,
          ]
        : []),
    ],
    [userRole, onDelete]
  );

  // Initialize table
  const table = useReactTable({
    data: sources,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search/Filter Input */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search sources by title..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} source(s)
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No sources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
