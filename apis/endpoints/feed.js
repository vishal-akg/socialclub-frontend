import { httpClient } from "../http-client";

export const getUserFeed = (data) => httpClient.get(`/feeds`, { params: data });
