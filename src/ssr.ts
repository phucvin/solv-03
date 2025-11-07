import { CommandMap } from "./shared";

export default function (cid: number, cm: CommandMap): string {
    let s = `
<html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <head>
    <body></body>
    <script type="module">
        import '/client.mjs';
        import './index_handlers.mjs';
        globalThis.SOLV_CID = ${cid};
        solv.applyCommandMap(JSON.parse(\`\n${JSON.stringify(cm, null, 2)}\n\`));
    </script>
</html>
`

    return s;
}