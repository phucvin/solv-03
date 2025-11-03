import { IncomingMessage, ServerResponse } from "node:http";
import { Solv, render } from "../../server";

async function App(solv: Solv) {
    const hello = solv.newElement('span');
    hello.setValue('innerHTML', 'hello');
    solv.getElement('$body').setChildren([hello.id]);
}

async function serve(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(await render(App));
}

export default serve;