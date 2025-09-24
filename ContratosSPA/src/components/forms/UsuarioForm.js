import React, { useMemo, useState, useEffect, useRef } from "react";
import "../css/forms.css";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
 import { getUsuario } from "../../services/account-services";

export default function Usuarios() {
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("nome", {
        header: () => "Nome",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: () => "E-mail",
        cell: (info) => info.getValue(),
      }),
    ],
    []
  );

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageIndex(0); 
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
       const { rows, total } = await getUsuario({ search, page: pageIndex + 1, pageSize });

        if (!alive) return;
        setRows(rows);
        setTotal(total);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError(e.message || "Falha ao carregar usuários.");
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [search, pageIndex, pageSize]);

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    state: {
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      if (next.pageIndex !== pageIndex) setPageIndex(next.pageIndex);
      if (next.pageSize !== pageSize) setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="card">
      <div className="card-head toolbar">
        <div className="left">
          <h3 className="card-title">Usuários</h3>
          <p className="muted">Busca na API • Paginação server-side</p>
        </div>
        <div className="right">
          <input
            className="search"
            placeholder="Buscar (nome ou e-mail)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="dt-wrapper">
        <table className="dt-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="empty">
                  Carregando...
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="btn-ghost"
          onClick={() => table.setPageIndex(0)}
          disabled={pageIndex === 0 || loading}
          title="Primeira página"
        >
          « Primeiro
        </button>

        <button
          className="btn-ghost"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || loading}
        >
          ← Anterior
        </button>

        <span>
          Página {pageIndex + 1} de {table.getPageCount() || 1}
        </span>

        <button
          className="btn-ghost"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || loading}
        >
          Próxima →
        </button>

        <button
          className="btn-ghost"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={pageIndex >= table.getPageCount() - 1 || loading}
          title="Última página"
        >
          Última »
        </button>

        <select
          className="page-size"
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
            table.setPageIndex(0);
          }}
          disabled={loading}
        >
          {[10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s} / página
            </option>
          ))}
        </select>

        <span className="muted" style={{ marginLeft: "auto" }}>
          {loading ? "Carregando..." : `${total} usuário(s)`}
        </span>
      </div>
    </div>
  );
}
