import { httpClient } from "../http-client";

export const addPost = (data) => httpClient.post(`/posts`, data);
export const getAllPosts = () => httpClient.get("/posts");
export const addReaction = (id, data) =>
  httpClient.post(`/posts/${id}/reactions`, data);
export const deleteReaction = (id, reactionId) =>
  httpClient.delete(`/posts/${id}/reactions/${reactionId}`);
export const getMyReaction = (id) => httpClient.get(`/posts/${id}/my-reaction`);
export const addComment = (id, data) =>
  httpClient.post(`/posts/${id}/comments`, data);
export const getAllComments = (id, { limit, offset }) =>
  httpClient.get(`/posts/${id}/comments`, { params: { limit, offset } });
