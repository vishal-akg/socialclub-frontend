import { httpClient } from "../http-client";

export const _register = (data) => httpClient.post(`/auth/register`, data);
export const _login = (data) => httpClient.post(`/auth/login`, data);
export const _logout = () => httpClient.post("/auth/logout");
