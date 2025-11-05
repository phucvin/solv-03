import express from 'express';

import { serve } from './server';

const app = express();

app.use(express.static('.', { cacheControl: true, maxAge: "1h" }));

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

app.post('/api', (req, res) => {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
});

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
