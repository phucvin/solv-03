import { IncomingMessage, ServerResponse } from "node:http";
import client from '../../client';

const clientCode = client.toString();

async function serve(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<html>
<body>
<h1>Counter01</h1>
</body>
<script>
const __name = () => {};
const solv = (${clientCode})();
</script>
</html>
`);
}

export default serve;