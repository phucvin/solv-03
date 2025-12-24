import { Hono } from 'hono';
import { serve as serveNode } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import { serve, act } from './server';

// Load all handlers that might be needed by this server,
// so they can be found when processing '/action'.
import './routes/counter01/index_handlers.mjs';
import './routes/counter02/index_handlers.mjs';
import './routes/counter03/index_handlers.mjs';

const app = new Hono();

app.use('*', serveStatic({ root: './' }));

app.get('/routes/*', async (c) => {
	try {
		const route = await import(`.${c.req.path}/index.mjs`);
		const html = await serve(route.default);
		return c.html(html);
	} catch (err) {
		console.log('Error routing', c.req.path, err);
		return c.text('Internal Error', 500);
	}
});

app.post('/action', act);

app.get('/', (c) => {
	return c.html(`
<h1>Index</h1>
<h2><a href="/routes/counter01">Counter 01</a></h2>
<h2><a href="/routes/counter02">Counter 02</a></h2>
<h2><a href="/routes/counter03">Counter 03</a></h2>
	`);
});

app.all('*', (c) => {
	return c.text('Not Found', 404);
});

console.log('Starting solv-03');

const port = 8080;
serveNode({
	fetch: app.fetch,
	port
});
