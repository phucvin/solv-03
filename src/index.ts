import { IncomingMessage, ServerResponse, createServer } from 'node:http';

import counter01 from './routes/counter01';

const server = createServer(async (req, res) => {
	const routes = new Map<string, (req: IncomingMessage, res: ServerResponse) => Promise<void>>([
		['/counter01', counter01],
	]);
	if (!req.url || req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		let index = '<h1>Index</h1>';
		for (const [route, _] of routes.entries()) {
			index += `<h2><a href="${route}">${route.slice(1)}</a></h2>`;
		}
		res.end(index);
	} else if (routes.has(req.url)) {
		await (routes.get(req.url)!(req, res));
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