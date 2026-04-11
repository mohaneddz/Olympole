"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownAZ, ArrowUpAZ, RefreshCw, Search } from "lucide-react";

type Direction = "asc" | "desc";

export type DataTableColumn<Row> = {
  key: keyof Row | string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: Row) => ReactNode;
};

export type DataTableFilter<Row> = {
  key: keyof Row | string;
  label: string;
  allLabel?: string;
  options: Array<{ label: string; value: string }>;
};

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function maybeDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function AdminDataTable<Row extends { id: string }>({
  title,
  rows,
  columns,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filters = [],
  initialPageSize = 12,
  maxRowsPerPage = 80,
  rowsPerPageOptions,
  headerCellPaddingClassName = "px-4 py-3",
  bodyCellPaddingClassName = "px-4 py-3",
  emptyMessage = "No rows found.",
  actionsLabel = "Actions",
  renderActions,
}: {
  title: string;
  rows: Row[];
  columns: DataTableColumn<Row>[];
  searchPlaceholder?: string;
  searchKeys?: Array<keyof Row | string>;
  filters?: Array<DataTableFilter<Row>>;
  initialPageSize?: number;
  maxRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  headerCellPaddingClassName?: string;
  bodyCellPaddingClassName?: string;
  emptyMessage?: string;
  actionsLabel?: string;
  renderActions?: (row: Row) => ReactNode;
}) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const resolvedPageSizeOptions = useMemo(() => {
    const safeMax = Math.max(1, maxRowsPerPage);
    const baseOptions = rowsPerPageOptions?.length ? rowsPerPageOptions : [10, 20, 40, 80];

    const normalized = Array.from(
      new Set(baseOptions.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0))
    )
      .map((value) => Math.min(Math.floor(value), safeMax))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);

    const initial = Math.min(Math.max(1, Math.floor(initialPageSize)), safeMax);
    if (!normalized.includes(initial)) {
      normalized.push(initial);
      normalized.sort((a, b) => a - b);
    }

    return normalized.length > 0 ? normalized : [initial];
  }, [initialPageSize, maxRowsPerPage, rowsPerPageOptions]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>(String(columns[0]?.key ?? "id"));
  const [direction, setDirection] = useState<Direction>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    return resolvedPageSizeOptions.includes(initialPageSize) ? initialPageSize : resolvedPageSizeOptions[0];
  });
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map((filter) => [String(filter.key), "__all__"]))
  );

  const effectivePageSize = resolvedPageSizeOptions.includes(pageSize) ? pageSize : resolvedPageSizeOptions[0];

  const searchedFilteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const passesSearch =
        !query ||
        searchKeys.some((key) => normalizeValue((row as Record<string, unknown>)[String(key)]).toLowerCase().includes(query));

      if (!passesSearch) {
        return false;
      }

      return filters.every((filter) => {
        const selected = filterValues[String(filter.key)];
        if (!selected || selected === "__all__") {
          return true;
        }
        const raw = normalizeValue((row as Record<string, unknown>)[String(filter.key)]);
        return raw === selected;
      });
    });
  }, [rows, search, searchKeys, filters, filterValues]);

  const sortedRows = useMemo(() => {
    const key = sortKey;
    const multiplier = direction === "asc" ? 1 : -1;

    return [...searchedFilteredRows].sort((left, right) => {
      const leftRaw = normalizeValue((left as Record<string, unknown>)[key]);
      const rightRaw = normalizeValue((right as Record<string, unknown>)[key]);

      const leftDate = maybeDate(leftRaw);
      const rightDate = maybeDate(rightRaw);
      if (leftDate !== null && rightDate !== null) {
        return (leftDate - rightDate) * multiplier;
      }

      const leftNumber = Number(leftRaw);
      const rightNumber = Number(rightRaw);
      if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return (leftNumber - rightNumber) * multiplier;
      }

      return leftRaw.localeCompare(rightRaw) * multiplier;
    });
  }, [searchedFilteredRows, sortKey, direction]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * effectivePageSize;
    return sortedRows.slice(start, start + effectivePageSize);
  }, [sortedRows, safePage, effectivePageSize]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("asc");
  }

  return (
    <section className="space-y-4 rounded-2xl border border-card-border bg-card-bg/60 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-foreground/70">
            {sortedRows.length} result{sortedRows.length === 1 ? "" : "s"}
          </div>
          <button
            type="button"
            onClick={() => {
              startRefreshTransition(() => {
                router.refresh();
              });
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border px-3 text-sm font-medium text-foreground/80 hover:text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isRefreshing}
            title="Refresh table data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-card-border bg-background/60 pl-10 pr-3"
          />
        </label>

        <div className="flex flex-wrap items-end gap-2 lg:justify-end">
          {filters.map((filter) => (
            <label key={String(filter.key)} className="flex min-w-40 flex-col gap-1 text-sm text-foreground/70">
              <span>{filter.label}</span>
              <select
                value={filterValues[String(filter.key)] ?? "__all__"}
                onChange={(event) => {
                  setFilterValues((current) => ({
                    ...current,
                    [String(filter.key)]: event.target.value,
                  }));
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-card-border bg-background/60 px-3"
              >
                <option value="__all__">{filter.allLabel ?? "All"}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex min-w-20 flex-col gap-1 text-sm text-foreground/70">
            <span>Rows</span>
            <select
              value={String(effectivePageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-card-border bg-background/60 px-3"
            >
              {resolvedPageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="bg-background/50 text-foreground/70">
              {columns.map((column) => {
                const key = String(column.key);
                return (
                  <th key={key} className={`${headerCellPaddingClassName} ${column.className ?? ""}`}>
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
                      >
                        {column.label}
                        {sortKey === key ? (
                          direction === "asc" ? (
                            <ArrowUpAZ className="h-4 w-4" />
                          ) : (
                            <ArrowDownAZ className="h-4 w-4" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      <span className="font-semibold">{column.label}</span>
                    )}
                  </th>
                );
              })}
              {renderActions ? <th className={`${headerCellPaddingClassName} font-semibold`}>{actionsLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className={`${bodyCellPaddingClassName} py-8 text-center text-foreground/60`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-t border-card-border/60 align-top">
                  {columns.map((column) => {
                    const key = String(column.key);
                    return (
                      <td key={key} className={`${bodyCellPaddingClassName} ${column.className ?? ""}`}>
                        {column.render ? column.render(row) : normalizeValue((row as Record<string, unknown>)[key]) || "-"}
                      </td>
                    );
                  })}
                  {renderActions ? <td className={bodyCellPaddingClassName}>{renderActions(row)}</td> : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-foreground/60">
          Page {safePage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-card-border px-3 py-1.5"
            disabled={safePage <= 1}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-lg border border-card-border px-3 py-1.5"
            disabled={safePage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
