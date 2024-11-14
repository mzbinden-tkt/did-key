import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerConfig from '../swagger.json';
import { connectClient } from './repository';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware } from './middlewares/metricsMiddleware';
import didRouter from './router/did';
import logger from './utils/logger';

const specs = swaggerJsdoc(swaggerConfig);

const initDB = async () => {
  try {
    await connectClient();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
  }
};

initDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(metricsMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(didRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
