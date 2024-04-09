import WebSocket from "ws";
import env from "./common/env";
import { handleConnection } from "./socket";

const wss = new WebSocket.Server({ port: env.PORT });

console.log(`Server started on port ${env.PORT}`);

wss.on("connection", handleConnection);
