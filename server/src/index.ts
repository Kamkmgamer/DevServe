import app from "./app";
import logger from "./lib/logger";

const port = process.env.PORT || 8000;

app.listen(port, () => {
  // Use centralized logger with requestId context where available
  // Note: requestId is generally available in request scope; for startup logs it's typically absent.
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});