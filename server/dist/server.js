"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = 3001;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down server...");
    server.close(() => process.exit(0));
});
process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down server...");
    server.close(() => process.exit(0));
});
exports.default = server;
