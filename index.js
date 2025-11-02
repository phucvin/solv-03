import express from 'express';
import { httpServerHandler } from 'cloudflare:node';

const app = express();
const port = 3010;

app.get('/', (req, res) => {
  res.end('hello');
});

app.listen(port, () => {
  console.log(`solv-03 listening at http://localhost:${port}`);
});

export default httpServerHandler({ port });
