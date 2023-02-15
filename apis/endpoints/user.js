import { httpClient } from "../http-client";

export const _me = () => httpClient.get(`/users/me`);
export const getProfilePictureUploadSignedUrl = (data) =>
  httpClient.get(`/users/profile-picture-upload-signed-url`, { params: data });
export const getUserPosts = (id) => httpClient.get(`/users/${id}/posts`);
