import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { rankItem } from "@tanstack/match-sorter-utils";

import { getCompany } from "../../services/companies-services";
import { getContracts, postContract, putContract } from "../../services/contracts-services";

const STATUS_MAP = { Ativo: 1, Vencido: 2, Cancelado: 3 };
const mapStatusTextToNumber = (s) => STATUS_MAP[s] ?? 1;
const mapStatusNumberToText = (n) =>
  n === 1 ? "Ativo" : n === 2 ? "Vencido" : n === 3 ? "Cancelado" : String(n);

const parseCurrencyBR = (s) => {
  const num = Number(String(s ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(num) ? num : 0;
};
const fmtMoeda = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const fmtDataBR = (iso) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("pt-BR") : "-");
const toInputDate = (d) => (d ? String(d).slice(0, 10) : "");

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const item = String(row.getValue(columnId) ?? "");
  const v = String(value ?? "");
  const rank = rankItem(item, v);
  addMeta?.({ itemRank: rank });
  return rank.passed;
};

function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
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
      empresaId: null,
      empresaNome: "",
      descricao: "",
      inicio: "",
      fim: "",
      status: "Ativo",
      valor: "",
    }
  );

  const [empresas, setEmpresas] = useState([]);
  const [empSearch, setEmpSearch] = useState("");

  useEffect(() => {
    setForm(
      initial ?? {
        id: null,
        numero: "",
        empresaId: null,
        empresaNome: "",
        descricao: "",
        inicio: "",
        fim: "",
        status: "Ativo",
        valor: "",
      }
    );
  }, [initial]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { rows } = await getCompany({
          search: empSearch,
          page: 1,
          pageSize: 100,
          sortBy: "nome",
          sortDir: "asc",
        });
        if (!cancel) {
          setEmpresas((rows ?? []).map((e, i) => ({ id: e.id ?? i, nome: e.nome ?? "" })));
        }
      } catch (e) {
        console.error("Falha ao buscar empresas (getCompany)", e);
        if (!cancel) setEmpresas([]);
      }
    })();
    return () => { cancel = true; };
  }, [empSearch]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.numero?.trim()) return alert("Informe o número do contrato.");
    if (!form.empresaId) return alert("Selecione a empresa.");

    const payload = {
      id: form.id ?? null,
      nome: form.descricao?.trim() || form.numero?.trim(),
      numero: form.numero?.trim(),
      descricao: form.descricao?.trim() || "",
      valor: parseCurrencyBR(form.valor),
      empresaId: Number(form.empresaId),
      dataInicio: form.inicio ? String(form.inicio).slice(0, 10) : null,
      dataFim: form.fim ? String(form.fim).slice(0, 10) : null,
      status: mapStatusTextToNumber(form.status),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={salvar} className="form grid" noValidate>
      <div className="grid-2">
        <div>
          <label>Número</label>
          <input name="numero" value={form.numero ?? ""} onChange={handle} placeholder="CT-0001" />
        </div>

        <div>
          <label>Empresa</label>
          <select
            name="empresaId"
            value={form.empresaId ?? ""}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              const sel = empresas.find((x) => x.id === id);
              setForm((f) => ({ ...f, empresaId: id, empresaNome: sel?.nome ?? "" }));
            }}
          >
            <option value="">Selecione...</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
          <small className="muted">
            Precisa filtrar?{" "}
            <input
              className="inline-input"
              placeholder="buscar empresa..."
              value={empSearch}
              onChange={(ev) => setEmpSearch(ev.target.value)}
            />
          </small>
        </div>
      </div>

      <div className="grid-1">
        <label>Descrição</label>
        <input name="descricao" value={form.descricao ?? ""} onChange={handle} placeholder="Descrição do contrato" />
      </div>

      <div className="grid-3">
        <div>
          <label>Início</label>
          <input type="date" name="inicio" value={form.inicio ?? ""} onChange={handle} />
        </div>
        <div>
          <label>Fim</label>
          <input type="date" name="fim" value={form.fim ?? ""} onChange={handle} />
        </div>
        <div>
          <label>Status</label>
          <select name="status" value={form.status ?? "Ativo"} onChange={handle}>
            <option>Ativo</option>
            <option>Vencido</option>
            <option>Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>Valor (R$)</label>
          <input name="valor" value={form.valor ?? ""} onChange={handle} placeholder="10.000,00" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  );
}

export default function ContratosPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { pageIndex, pageSize } = pagination;


  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("numero", { header: () => "Número", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("empresaNome", { header: () => "Empresa", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("descricao", { header: () => "Descrição", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("inicio", { header: () => "Início", cell: (info) => fmtDataBR(info.getValue()) }),
      columnHelper.accessor("fim", { header: () => "Fim", cell: (info) => fmtDataBR(info.getValue()) }),
      columnHelper.accessor("status", {
        header: () => "Status",
        cell: (info) => <span className={`badge ${info.getValue()}`}>{info.getValue()}</span>,
      }),
      columnHelper.accessor("valor", { header: () => "Valor", cell: (info) => fmtMoeda(info.getValue()) }),
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
          </div>
        ),
      }),
    ],
    []
  );

  const pageCount = Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,   
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: "fuzzy",
    getRowId: (row, index) => row.id ?? row.numero ?? String(index),
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const { rows: apiRows, total } = await getContracts({
        page: pageIndex + 1,
        pageSize,
      });

      const mapped = (apiRows ?? []).map((u, i) => ({
        id: u.id ?? i,
        numero: u.numero ?? "",
        empresaId: u.supplierId ?? u.empresaId ?? u.supplier?.id ?? null,
        empresaNome: u.supplierNome ?? u.empresaNome ?? u.supplier?.nome ?? "",
        descricao: u.descricao ?? "",
        inicio: u.dataInicio ?? u.inicio ?? null,
        fim: u.dataFim ?? u.fim ?? null,
        status: mapStatusNumberToText(u.status),
        valor: Number(u.valor ?? 0),
      }));

      setRows(mapped);
      setTotal(Number(total) || 0);
    } catch (e) {
      console.error(e);
      setErrMsg(e?.response?.data?.message || e?.response?.data?.detail || "Falha ao buscar contratos.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => { load(); }, [load]);

  const abrirNovo = () => { setEditRow(null); setModalOpen(true); };

  const salvarContrato = async (payload) => {
    try {
      if (payload?.id) {
        const { id, ...data } = payload;
        await putContract(id, data);
      } else {
        await postContract(payload);
      }
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      await load();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail || e?.response?.data?.message || "Falha ao salvar contrato.");
    }
  };

  const onHeaderClick = (header) => {
    const canSort = header.column.getCanSort?.();
    if (canSort) header.column.toggleSorting();
  };

  const goPrev = () => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }));
  const goNext = () =>
    setPagination((p) => {
      const pc = Math.max(1, Math.ceil(total / p.pageSize));
      return { ...p, pageIndex: Math.min(pc - 1, p.pageIndex + 1) };
    });

  return (
    <div className="card">
      <div className="card-head toolbar">
        <div className="left">
          <h3 className="card-title">Contratos</h3>
          <p className="muted">Ordene nos cabeçalhos • Busque por nº, empresa, descrição…</p>
        </div>
        <div className="right">
          <input
            className="search"
            placeholder="Buscar (nº, empresa, descrição...)"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button className="btn-primary" onClick={abrirNovo}>Novo Contrato</button>
        </div>
      </div>

      {errMsg && <div className="alert error">{errMsg}</div>}

      <div className={`dt-wrapper ${loading ? "loading" : ""}`}>
        <table className="dt-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const dir = header.column.getIsSorted?.();
                  const sortable = header.column.getCanSort?.();
                  return (
                    <th
                      key={header.id}
                      onClick={() => onHeaderClick(header)}
                      className={sortable ? "sortable" : undefined}
                      role={sortable ? "button" : undefined}
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
            {!loading && table.getRowModel().rows.map((r) => (
              <tr key={r.id}>
                {r.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
            {!loading && table.getRowModel().rows.length === 0 && (
              <tr><td colSpan={columns.length} className="empty">Nenhum registro encontrado.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={columns.length} className="loading-row">Carregando…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn-ghost" onClick={goPrev} disabled={loading || pageIndex === 0}>← Anterior</button>
        <span> Página {pageIndex + 1} de {pageCount} </span>
        <button className="btn-ghost" onClick={goNext} disabled={loading || pageIndex + 1 >= pageCount}>Próxima →</button>
        <select
          className="page-size"
          value={pageSize}
          onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
        >
          {[10, 20, 50].map((s) => (<option key={s} value={s}>{s} / página</option>))}
        </select>
      </div>

      <Modal
        open={modalOpen}
        title={editRow ? "Editar Contrato" : "Novo Contrato"}
        onClose={() => setModalOpen(false)}
      >
        <ContratoForm
          key={editRow ? `edit-${editRow.id}` : "new"}
          initial={editRow ? {
            id: editRow.id ?? null,
            numero: editRow.numero ?? "",
            empresaId: editRow.empresaId ?? null,
            empresaNome: editRow.empresaNome ?? "",
            descricao: editRow.descricao ?? "",
            inicio: toInputDate(editRow.inicio),
            fim: toInputDate(editRow.fim),
            status: editRow.status ?? "Ativo",
            valor: (editRow.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          } : null}
          onSubmit={salvarContrato}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
