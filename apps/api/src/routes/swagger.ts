import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import swaggerDocument from '../../swagger.json' with { type: 'json' };

const swagger = new Hono();

swagger.get(
  '/',
  swaggerUI({
    url: '/swagger.json',
    title: 'API Docs',
    spec: swaggerDocument,
  })
);

export default swagger;
