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

import { postCompany } from "../../services/account-services";

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
const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());

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

function EmpresaForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      if (name === "document") return { ...f, document: maskCNPJ(value) };
      if (name === "phone") return { ...f, phone: maskPhone(value) };
      return { ...f, [name]: value };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Informe o nome da empresa.";
    if (!form.document?.trim()) errs.document = "Informe o CNPJ.";
    else if (!isValidCNPJ(form.document)) errs.document = "CNPJ inválido.";
    if (!form.email?.trim()) errs.email = "Informe o e-mail.";
    else if (!isValidEmail(form.email)) errs.email = "E-mail inválido.";
    const phoneDigits = onlyDigits(form.phone);
    if (!phoneDigits) errs.phone = "Informe o telefone.";
    else if (phoneDigits.length < 10) errs.phone = "Telefone incompleto.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const salvar = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      document: onlyDigits(form.document),
      email: form.email.trim(),
      phone: onlyDigits(form.phone),
    };
    onSubmit(payload);
  };

  const inputClass = (key) => (errors[key] ? "invalid" : "");

  return (
    <form onSubmit={salvar} className="form grid" noValidate>
      <div className="grid-2">
        <div>
          <label>Nome</label>
          <input name="name" value={form.name} onChange={handle} placeholder="Nome da empresa" className={inputClass("name")} />
          {errors.name && <small className="error">{errors.name}</small>}
        </div>
        <div>
          <label>CNPJ</label>
          <input name="document" value={form.document} onChange={handle} placeholder="00.000.000/0000-00" className={inputClass("document")} inputMode="numeric" />
          {errors.document && <small className="error">{errors.document}</small>}
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
          <input name="phone" value={form.phone} onChange={handle} placeholder="(11) 99999-9999" className={inputClass("phone")} inputMode="numeric" />
          {errors.phone && <small className="error">{errors.phone}</small>}
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
  const [data, setData] = useState([]); 
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: () => "Nome", cell: (info) => info.getValue() }),
      columnHelper.accessor("document", { header: () => "Documento", cell: (info) => info.getValue() }),
      columnHelper.accessor("email", { header: () => "E-mail", cell: (info) => info.getValue() }),
      columnHelper.accessor("phone", { header: () => "Telefone", cell: (info) => info.getValue() }),
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
    initialState: { pagination: { pageSize: 10 } },
    getRowId: (row, index) => row.id ?? row.document ?? row.email ?? String(index),
  });

  const abrirNovo = () => setModalOpen(true);

  const salvarEmpresa = async (payload) => {
    try {
      const saved = await postCompany(payload); 
      const exibicao = {
        id: saved?.id,
        name: saved?.name ?? payload.name,
        document: maskCNPJ(saved?.document ?? payload.document),
        email: saved?.email ?? payload.email,
        phone: maskPhone(saved?.phone ?? payload.phone),
      };
      setData((d) => [exibicao, ...d]); 
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail || "Falha ao salvar empresa.");
    }
  };

  return (
    <div className="card">
      <div className="card-head toolbar">
        <div className="left">
          <h3 className="card-title">Empresas</h3>
          <p className="muted">Ordene nos cabeçalhos • Busque por nome, doc, e-mail ou telefone</p>
        </div>
        <div className="right">
          <input className="search" placeholder="Buscar (nome, documento, e-mail, telefone)" value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} />
          <button className="btn-primary" onClick={abrirNovo}>Nova Empresa</button>
        </div>
      </div>

      <div className="dt-wrapper">
        <table className="dt-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort?.();
                  const dir = header.column.getIsSorted?.();
                  return (
                    <th key={header.id} onClick={sortable ? header.column.getToggleSortingHandler() : undefined} className={sortable ? "sortable" : undefined}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortable && <span className="sort-indicator">{dir === "asc" ? " ↑" : dir === "desc" ? " ↓" : " ↕"}</span>}
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
              <tr><td colSpan={columns.length} className="empty">Nenhum registro encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn-ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>← Anterior</button>
        <span> Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1} </span>
        <button className="btn-ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próxima →</button>
        <select className="page-size" value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
          {[10, 20, 50].map((s) => (<option key={s} value={s}>{s} / página</option>))}
        </select>
      </div>

      <Modal open={modalOpen} title="Nova Empresa" onClose={() => setModalOpen(false)}>
        <EmpresaForm onSubmit={salvarEmpresa} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
