import { httpClient } from "../http-client";

export const getFollowings = ({ offset, limit }) =>
  httpClient.get(`/followings`, { params: { offset, limit } });
export const addFollowing = (id) =>
  httpClient.post(`/followings`, { followerId: id });
export const deleteFollowing = (id) => httpClient.delete(`/followings/${id}`);
export const isFollowing = (data) =>
  httpClient.get(`/followings/exist`, { params: data });
export const getWhomToFollow = (data) =>
  httpClient.get("followings/whom-to-follow", { params: data });
