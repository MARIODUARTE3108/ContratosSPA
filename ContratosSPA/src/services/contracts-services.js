import axios from "axios";
import * as config from '../config/api-config';
import { getAccessToken, signOut } from "../helpers/auth-helper"; // <-- ADICIONE ISTO

export const postContract = (data) => {
    const token = getAccessToken();

  return axios.post(`${config.getApiUrl()}/contracts`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,

  })
  .then(res => res.data);
};

export const putContract = (id, data) => {
  const token = getAccessToken();
  return axios.put(`${config.getApiUrl()}/contracts/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(r => r.data);
};

export const getContracts = (data = {}) => {
  const token = getAccessToken();

  const page = data.page ?? data.pageNumber ?? 1;
  const size = data.pageSize ?? data.size ?? 10;
  const q = (data.search ?? data.q ?? "").trim();

  const sortParam =
    data.sort ??
    (data.sortBy && data.sortDir ? `${data.sortBy},${data.sortDir}` : undefined);

  return axios
    .get(config.getApiUrl() + "/contracts", {
      params: {
        page,
        size,
        q,
        sort: sortParam,
        sortBy: data.sortBy,
        sortDir: data.sortDir,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => {
      const raw = response.data;

      // Normaliza: {items,total} | [ ... ] | { ...obj... }
      let items = [];
      let totalFromBody;

      if (raw && Array.isArray(raw.items)) {
        items = raw.items;
        totalFromBody = Number(raw.total);
      } else if (Array.isArray(raw)) {
        items = raw;
      } else if (raw && typeof raw === "object") {
        items = [raw];
      }

      const totalHeader = Number(response.headers["x-total-count"]);
      const total =
        (Number.isFinite(totalFromBody) && totalFromBody) ||
        (Number.isFinite(totalHeader) && totalHeader) ||
        items.length;

      // Devolve “cru” com nomes do backend; a página formata para exibição
      const rows = items.map((u) => ({
        id: u.id,
        numero: u.numero ?? "",
        descricao: u.descricao ?? "",
        valor: u.valor ?? 0,
        supplierId: u.supplierId ?? u.empresaId ?? u.supplier?.id ?? null,
        supplierNome: u.supplier?.nome ?? u.empresaNome ?? "",
        dataInicio: u.dataInicio ?? u.inicio ?? null,
        dataFim: u.dataFim ?? u.fim ?? null,
        status: u.status, // numérico (a página converte para texto)
      }));

      return { rows, total };
    })
    .catch((err) => {
      console.error("getContracts error:", err);
      return { rows: [], total: 0 };
    });
};