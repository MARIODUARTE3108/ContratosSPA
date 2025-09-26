import axios from "axios";
import * as config from '../config/api-config';
import { getAccessToken, signOut } from "../helpers/auth-helper"; 

export const postCompany = (data) => {
    const token = getAccessToken();

  return axios.post(`${config.getApiUrl()}/suppliers`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,

  })
  .then(res => res.data);
};

// services/companies-services.js
export const getCompany = (data = {}) => {
  const token = getAccessToken();

  const page = data.page ?? 1;
  const size = data.pageSize ?? data.size ?? 10;
  const q = (data.search ?? data.q ?? "").trim();

  const sortParam =
    data.sort ??
    (data.sortBy && data.sortDir ? `${data.sortBy},${data.sortDir}` : undefined);

  return axios
    .get(config.getApiUrl() + "/suppliers", {
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
      } else {
        items = [];
      }

      const totalHeader = Number(response.headers["x-total-count"]);
      const total =
        (Number.isFinite(totalFromBody) && totalFromBody) ||
        (Number.isFinite(totalHeader) && totalHeader) ||
        items.length;

      const rows = items.map((u) => ({
        id: u.id,
        nome: u.nome ?? u.name ?? "",
        cnpj: u.cnpj ?? u.document ?? u.cnpjNumber ?? "",
        telefone: u.telefone ?? u.phone ?? u.telefoneContato ?? "",
        email: u.email ?? "",
      }));

      return { rows, total };
    })
    .catch((err) => {
      console.error("getCompany error:", err);
      return { rows: [], total: 0 };
    });
};
