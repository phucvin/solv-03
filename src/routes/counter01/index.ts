import { ServerResponse } from "node:http";

export default async (req, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Counter01</h1>');
};