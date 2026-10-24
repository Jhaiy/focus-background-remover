import { app } from './app.ts';
import { config } from './config/config.ts';
import { loadSession } from './inferences/session.ts';
import { logger } from './utils/logger.ts';

await loadSession();

app.listen(config.port, () => logger.info(`Focus listening on port ${config.port}`));
