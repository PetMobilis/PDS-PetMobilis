import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_HOST}:${process.env.EXPO_PUBLIC_IO_PORT}/api`,
});
