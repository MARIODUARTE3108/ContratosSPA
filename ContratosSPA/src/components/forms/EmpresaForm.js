import React, { useMemo, useState, useEffect } from "react";
import "../css/forms.css";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

import { postCompany, getCompany } from "../../services/companies-services";

const onlyDigits = (s = "") => s.replace(/\D/g, "");
const maskCNPJ = (v = "") => {
  const d = onlyDigits(v).slice(0, 14);
  let out = "";
  if (d.length > 0) out = d.substring(0, 2);
  if (d.length >= 3) out += "." + d.substring(2, 5);
  if (d.length >= 6) out += "." + d.substring(5, 8);
  if (d.length >= 9) out += "/" + d.substring(8, 12);
  if (d.length >= 13) out += "-" + d.substring(12, 14);
  return out;
};
const maskPhone = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m, a, b, c) =>
      [a && `(${a}`, a && ") ", b, b && "-", c].filter(Boolean).join("")
    );
  }
  return d.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m, a, b, c) =>
    [a && `(${a}`, a && ") ", b, b && "-", c].filter(Boolean).join("")
  );
};

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());

const isValidCNPJ = (cnpjMasked = "") => {
  const cnpj = onlyDigits(cnpjMasked);
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let tamanho = 12, numeros = cnpj.substring(0, tamanho), digitos = cnpj.substring(tamanho);
  let soma = 0, pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) { soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--; if (pos < 2) pos = 9; }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;
  tamanho = tamanho + 1; numeros = cnpj.substring(0, tamanho); soma = 0; pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) { soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--; if (pos < 2) pos = 9; }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const item = String(row.getValue(columnId) ?? "");
  const v = String(value ?? "");
  const rank = rankItem(item, v);
  addMeta?.({ itemRank: rank });
  return rank.passed;
};

function EmpresaForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "" });
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      if (name === "cnpj") return { ...f, cnpj: maskCNPJ(value) };
      if (name === "telefone") return { ...f, telefone: maskPhone(value) };
      return { ...f, [name]: value };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.nome?.trim()) errs.nome = "Informe o nome da empresa.";
    if (!form.cnpj?.trim()) errs.cnpj = "Informe o CNPJ.";
    else if (!isValidCNPJ(form.cnpj)) errs.cnpj = "CNPJ inválido.";
    if (!form.email?.trim()) errs.email = "Informe o e-mail.";
    else if (!isValidEmail(form.email)) errs.email = "E-mail inválido.";
    const phoneDigits = onlyDigits(form.telefone);
    if (!phoneDigits) errs.telefone = "Informe o telefone.";
    else if (phoneDigits.length < 10) errs.telefone = "Telefone incompleto.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const salvar = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      nome: form.nome.trim(),
      cnpj: onlyDigits(form.cnpj),
      email: form.email.trim(),
      telefone: onlyDigits(form.telefone),
    });
  };

  const inputClass = (key) => (errors[key] ? "invalid" : "");

  return (
    <form onSubmit={salvar} className="form grid" noValidate>
      <div className="grid-2">
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handle} placeholder="Nome da empresa" className={inputClass("nome")} />
          {errors.nome && <small className="error">{errors.nome}</small>}
        </div>
        <div>
          <label>CNPJ</label>
          <input name="cnpj" value={form.cnpj} onChange={handle} placeholder="00.000.000/0000-00" className={inputClass("cnpj")} inputMode="numeric" />
          {errors.cnpj && <small className="error">{errors.cnpj}</small>}
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label>E-mail</label>
          <input type="email" name="email" value={form.email} onChange={handle} placeholder="contato@empresa.com" className={inputClass("email")} />
          {errors.email && <small className="error">{errors.email}</small>}
        </div>
        <div>
          <label>Telefone</label>
          <input name="telefone" value={form.telefone} onChange={handle} placeholder="(11) 99999-9999" className={inputClass("telefone")} inputMode="numeric" />
          {errors.telefone && <small className="error">{errors.telefone}</small>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  );
}

export default function Empresas() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { pageIndex, pageSize } = pagination;

  const debouncedSearch = useDebouncedValue(globalFilter, 400);

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("nome", { header: () => "Nome", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("cnpj", { header: () => "CNPJ", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("email", { header: () => "E-mail", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
      columnHelper.accessor("telefone", { header: () => "Telefone", cell: (info) => info.getValue(), filterFn: "fuzzy" }),
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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, 
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: "fuzzy",
    getRowId: (row, index) => row.id ?? row.cnpj ?? row.email ?? String(index),
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrMsg("");
      try {
        const resp = await getCompany({
          page: pageIndex + 1,
          pageSize,
        });

        const mapped = (resp.rows ?? []).map((x) => ({
          id: x.id,
          nome: x.nome,
          cnpj: maskCNPJ(x.cnpj),
          email: x.email,
          telefone: maskPhone(x.telefone),
        }));

        setRows(mapped);
        setTotal(Number(resp.total) || mapped.length);
      } catch (e) {
        console.error(e);
        setErrMsg(e?.response?.data?.detail || "Falha ao buscar empresas.");
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageIndex, pageSize]);

  const abrirNovo = () => setModalOpen(true);

  const salvarEmpresa = async (payload) => {
    try {
      await postCompany(payload);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
      setGlobalFilter("");
      const resp = await getCompany({ page: 1, pageSize });
      const mapped = (resp.rows ?? []).map((x) => ({
        id: x.id,
        nome: x.nome,
        cnpj: maskCNPJ(x.cnpj),
        email: x.email,
        telefone: maskPhone(x.telefone),
      }));
      setRows(mapped);
      setTotal(Number(resp.total) || mapped.length);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail || "Falha ao salvar empresa.");
    } finally {
      setModalOpen(false);
    }
  };

  const goPrev = () => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }));
  const goNext = () =>
    setPagination((p) => {
      const pc = Math.max(1, Math.ceil(total / p.pageSize));
      return { ...p, pageIndex: Math.min(pc - 1, p.pageIndex + 1) };
    });
  const changePageSize = (s) => setPagination({ pageIndex: 0, pageSize: s });

  const onHeaderClick = (header) => {
    const canSort = header.column.getCanSort?.();
    if (canSort) header.column.toggleSorting();
  };

  return (
    <div className="card">
      <div className="card-head toolbar">
        <div className="left">
          <h3 className="card-title">Empresas</h3>
          <p className="muted">Ordene nos cabeçalhos • Busque por nome, CNPJ, e-mail ou telefone</p>
        </div>
        <div className="right">
          <input
            className="search"
            placeholder="Buscar (nome, CNPJ, e-mail, telefone)"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button className="btn-primary" onClick={abrirNovo}>Nova Empresa</button>
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
        <select className="page-size" value={pageSize} onChange={(e) => changePageSize(Number(e.target.value))}>
          {[10, 20, 50].map((s) => (<option key={s} value={s}>{s} / página</option>))}
        </select>
      </div>

      <Modal open={modalOpen} title="Nova Empresa" onClose={() => setModalOpen(false)}>
        <EmpresaForm onSubmit={salvarEmpresa} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
