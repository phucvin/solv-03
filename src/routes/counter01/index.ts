import { IncomingMessage, ServerResponse } from "node:http";
import { Solv, render } from "../../server";
import { BODY, DOCUMENT } from "../../shared";

async function App(solv: Solv) {
    const hello = solv.newElement('span');
    hello.setValue('innerHTML', 'hello');
    solv.getElement(BODY).setChildren([hello.id]);
    solv.getElement(DOCUMENT).setValue('title', 'hello');
}

async function serve(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(await render(App));
}

export default serve;