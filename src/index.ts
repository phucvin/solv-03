import express from 'express';

import { serve, act } from './server';

// Load all handlers that might be needed by this server,
// so they can be found when processing '/action'.
import './routes/counter01/index_handlers.mjs';
import './routes/counter02/index_handlers.mjs';
import './routes/counter03/index_handlers.mjs';

const app = express();

app.use(express.static('bundle', { cacheControl: true, maxAge: '1h' }));
app.use(express.json());

app.get('/routes/*path', (req, res) => {
	import(`.${req.url}/index.mjs`)
		.then(route => serve(route.default))
		.then(html => {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		})
		.catch(err => {
			console.log('Error routing', req.url, err);
			res.writeHead(500, { 'Content-Type': 'text/html' });
			res.end('Internal Error');
		});
});

app.post('/action', act);

app.get('/', (req, res) => {
	res.end(`
<h1>Index</h1>
<h2><a href="/routes/counter01">Counter 01</a></h2>
<h2><a href="/routes/counter02">Counter 02</a></h2>
<h2><a href="/routes/counter03">Counter 03</a></h2>
	`);
});

app.get('*all', (req, res) => {
	res.writeHead(404, { 'Content-Type': 'text/plain' });
	res.end('Not Found');
});

console.log('Starting solv-03');

const port = 8080;
app.listen(port);

import { httpServerHandler } from "cloudflare:node";
export default httpServerHandler({ port });
