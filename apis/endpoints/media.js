import { httpClient } from "../http-client";

export const getMedia = (id) => httpClient.get(`/media/${id}`);
export const getMediaUploadSignature = (data) =>
  httpClient.get(`/media/signed-url`, { params: data });
