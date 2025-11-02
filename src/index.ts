import { createServer } from 'node:http';

import counter01 from './routes/counter01';

const server = createServer(async (req, res) => {
	const routes = {
		'/counter01': counter01,
	};
	if (req.url && routes[req.url]) {
		await routes[req.url];
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
