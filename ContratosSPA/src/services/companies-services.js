import axios from "axios";
import * as config from '../config/api-config';
import { getAccessToken, signOut } from "../helpers/auth-helper"; // <-- ADICIONE ISTO

export const postCompany = (data) => {
    const token = getAccessToken();

  return axios.post(`${config.getApiUrl()}/suppliers`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,

  })
  .then(res => res.data);
};

