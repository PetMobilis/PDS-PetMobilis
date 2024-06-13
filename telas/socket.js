import { io } from "socket.io-client";

export const socket = io(
  `${process.env.EXPO_PUBLIC_HOST}:${process.env.EXPO_PUBLIC_IO_PORT}`
);
