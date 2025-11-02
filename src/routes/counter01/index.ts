import { IncomingMessage, ServerResponse } from "node:http";

async function serve(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Counter01</h1>');
}

export default serve;