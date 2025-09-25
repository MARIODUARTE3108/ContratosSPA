import axios from "axios";
import * as config from '../config/api-config';
import { getAccessToken, signOut } from "../helpers/auth-helper"; // <-- ADICIONE ISTO

export const postLogin = (data) => {
    return axios.post(
        config.getApiUrl() + '/auth/login',
        data
    ).then(
        response => {
            return response.data;
        }
    )
}

export const postUsuario = (data) => {
    return axios.post(config.getApiUrl() + '/auth/register', data)
        .then(
            response => { return response.data; }
        )
}




