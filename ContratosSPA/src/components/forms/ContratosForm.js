import React, { useMemo, useState, useEffect } from "react";
import "../css/forms.css";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ContratoForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial ?? {
      id: null,
      numero: "",
      empresa: "",
      descricao: "",
      inicio: "",
      fim: "",
      status: "Ativo",
      valor: "",
    }
  );

  useEffect(() => {
    setForm(
      initial ?? {
        id: null,
        numero: "",
        empresa: "",
        descricao: "",
        inicio: "",
        fim: "",
        status: "Ativo",
        valor: "",
      }
    );
  }, [initial]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const salvar = (e) => {
    e.preventDefault();
    if (!form.numero || !form.empresa) return alert("Preencha número e empresa.");
    onSubmit({
      ...form,
      id: form.id ?? crypto.randomUUID(),
      valor: Number(String(form.valor).replace(",", ".")) || 0,
    });
  };

  return (
    <form onSubmit={salvar} className="form grid">
      <div className="grid-2">
        <div>
          <label>Número</label>
          <input name="numero" value={form.numero} onChange={handle} />
        </div>
        <div>
          <label>Empresa</label>
          <input name="empresa" value={form.empresa} onChange={handle} />
        </div>
      </div>

      <div className="grid-1">
        <label>Descrição</label>
        <input name="descricao" value={form.descricao} onChange={handle} />
      </div>

      <div className="grid-3">
        <div>
          <label>Início</label>
          <input type="date" name="inicio" value={form.inicio} onChange={handle} />
        </div>
        <div>
          <label>Fim</label>
          <input type="date" name="fim" value={form.fim} onChange={handle} />
        </div>
        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handle}>
            <option>Ativo</option>
            <option>Vencido</option>
            <option>Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Valor (R$)</label>
          <input name="valor" value={form.valor} onChange={handle} placeholder="10000,00" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}

export default function InserirImagemForm() {
  const base = [
    { numero: "CT-0001", empresa: "Alpha S.A.", descricao: "Manutenção FPSO", inicio: "2025-01-10", fim: "2025-12-31", status: "Ativo", valor: 1500000 },
    { numero: "CT-0002", empresa: "Beta Ltda.", descricao: "Fornecimento de peças", inicio: "2024-02-01", fim: "2024-11-30", status: "Vencido", valor: 320000 },
    { numero: "CT-0003", empresa: "Gamma Inc.", descricao: "Serviços elétricos", inicio: "2025-03-05", fim: "2026-03-04", status: "Ativo", valor: 890000 },
    { numero: "CT-0004", empresa: "Delta Oil", descricao: "Consultoria", inicio: "2023-08-01", fim: "2024-07-31", status: "Cancelado", valor: 0 },
  ];
  const seed = Array.from({ length: 26 }).flatMap((_, i) =>
    base.map((b, j) => ({
      id: crypto.randomUUID(),
      ...b,
      numero: `${b.numero}-${String(i + 1).padStart(2, "0")}`,
    }))
  );

  const [data, setData] = useState(seed);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const columnHelper = createColumnHelper();

  const fmtMoeda = (n) =>
    (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

  const fmtData = (iso) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("pt-BR") : "-");

  const columns = useMemo(
    () => [
      columnHelper.accessor("numero", {
        header: () => "Número",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("empresa", {
        header: () => "Empresa",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("descricao", {
        header: () => "Descrição",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("inicio", {
        header: () => "Início",
        cell: (info) => fmtData(info.getValue()),
      }),
      columnHelper.accessor("fim", {
        header: () => "Fim",
        cell: (info) => fmtData(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: () => "Status",
        cell: (info) => {
          const s = info.getValue();
          return <span className={`badge ${s}`}>{s}</span>;
        },
      }),
      columnHelper.accessor("valor", {
        header: () => "Valor",
        cell: (info) => fmtMoeda(info.getValue()),
      }),
      columnHelper.display({
        id: "actions",
        header: () => "Ações",
        cell: ({ row }) => (
          <div className="actions">
            <button
              className="btn-ghost"
              onClick={() => {
                setEditRow(row.original);
                setModalOpen(true);
              }}
            >
              Editar
            </button>
            <button
              className="btn-ghost danger"
              onClick={() => {
                if (window.confirm("Excluir este contrato?")) {
                  setData((d) => d.filter((c) => c.id !== row.original.id));
                }
              }}
            >
              Excluir
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), 
    initialState: {
      pagination: { pageSize: 10 }, 
    },
  });

  useEffect(() => {
    table.setPageSize(10);
  }, [table]);

  const abrirNovo = () => {
    setEditRow(null);
    setModalOpen(true);
  };

  const salvarContrato = (contrato) => {
    setData((d) => {
      const idx = d.findIndex((c) => c.id === contrato.id);
      if (idx >= 0) {
        const clone = [...d];
        clone[idx] = contrato;
        return clone;
      }
      return [contrato, ...d];
    });
    setModalOpen(false);
  };

  return (
    <div className="card">
      <div className="card-head toolbar">
        <div className="left">
          <h3 className="card-title">Contratos</h3>
          <p className="muted">Ordene clicando nos cabeçalhos • Pesquise por qualquer campo</p>
        </div>
        <div className="right">
          <input
            className="search"
            placeholder="Buscar (nº, empresa, status...)"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button className="btn-primary" onClick={abrirNovo}>
            Novo Contrato
          </button>
        </div>
      </div>

      <div className="dt-wrapper">
        <table className="dt-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const dir = header.column.getIsSorted(); 
                  return (
                    <th
                      key={header.id}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      className={sortable ? "sortable" : undefined}
                      title={sortable ? "Clique para ordenar" : ""}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortable && (
                        <span className="sort-indicator">
                          {dir === "asc" ? " ↑" : dir === "desc" ? " ↓" : " ↕"}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
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
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ← Anterior
        </button>

        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </span>

        <button
          className="btn-ghost"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima →
        </button>

        <select
          className="page-size"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s} / página
            </option>
          ))}
        </select>
      </div>

      <Modal
        open={modalOpen}
        title={editRow ? "Editar Contrato" : "Novo Contrato"}
        onClose={() => setModalOpen(false)}
      >
        <ContratoForm initial={editRow} onSubmit={salvarContrato} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
