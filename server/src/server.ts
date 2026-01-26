import app from "./app";

const PORT = 3001;

const server = app.listen(PORT, () => {
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

export default server;
