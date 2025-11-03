import { createServer } from 'node:http';

import { Solv } from './shared';
import { serve } from './server';

import counter01 from './routes/counter01';
import counter02 from './routes/counter02';

const server = createServer(async (req, res) => {
	const routes = new Map<string, (solv: Solv) => Promise<void>>([
		['/counter01', counter01],
		['/counter02', counter02],
	]);
	if (!req.url || req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		let index = '<h1>Index</h1>';
		for (const [route, _] of routes.entries()) {
			index += `<h2><a href="${route}">${route.slice(1)}</a></h2>`;
		}
		res.end(index);
	} else if (routes.has(req.url)) {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(await serve(routes.get(req.url)!));
	} else if (req.url === '/api/status') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	}
});

console.log('Starting solv-03');

const port = 8080;
server.listen(port);

import { httpServerHandler } from "cloudflare:node";
export default httpServerHandler({ port });