import axios from "axios";
import * as config from '../config/api-config';
import { getAccessToken, signOut } from "../helpers/auth-helper"; // <-- ADICIONE ISTO

export const postUsuario = (data) => {
    return axios.post(config.getApiUrl() + '/persons', data)
        .then(
            response => { return response.data; }
        )
}

export const getUsuario = (data = {}) => {
  const token = getAccessToken();
  return axios.get(config.getApiUrl() + "/persons", {
    params: {
      page: data.page ?? 1,
      size: data.pageSize ?? data.size ?? 10,
      q: data.search ?? data.q ?? "",
    },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  .then((response) => {
    const items = Array.isArray(response.data) ? response.data : [];
    const total = Number(response.headers["x-total-count"] ?? items.length);
    const rows = items.map(u => ({
      id: u.id,
      nome: u.nome ?? u.name ?? "",
      email: u.email ?? "",
    }));
    return { rows, total };
  });
};
