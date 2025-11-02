import express from 'express';
import { resolve, dirname } from 'path';
import { httpServerHandler } from 'cloudflare:node';

const app = express();
const port = 3010;

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(dirname('.'), 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export default httpServerHandler({ port });
