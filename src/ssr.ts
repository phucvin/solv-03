import { BODY, CommandMap, DOCUMENT, Id, UpdateElement } from "./shared";

function applyUpdate(this: any, update: UpdateElement) {
    if (update.sets) {
        this.properties = {};
        for (let [name, value] of Object.entries(update.sets || {})) {
            if (name == 'innerHTML') {
                this.innerHTML = value;
                continue;
            }
            if (name.startsWith('on')) {
                let code = '';
                for (const action of (Array.isArray(value) ? value : [value])) {
                    code += `solv.dispatch(${JSON.stringify(action)});`;
                }
                value = code;
            }
            this.properties[name] = value;
        }
    }
    if (update.children) {
        this.childrenId = update.children;
    }
}

function ssr(this: any, elements: { [id: Id]: any }) {
    let s = `<${this.tag} id='${this.id}'`;
    if (this.properties) {
        for (const [name, value] of Object.entries(this.properties)) {
            s += ` ${name}='${value}'`;
        }
    }
    s += '>';
    if (this.innerHTML) {
        s += this.innerHTML;
        s += `</${this.tag}>`;
    } else if (this.childrenId) {
        for (const childId of this.childrenId) {
            if (!elements[childId]) {
                throw new Error(`Missing childId during SSR: ${childId}`)
            }
            s += '\n';
            s += elements[childId].ssr(elements);
        }
        s += `\n</${this.tag}>`;
    }
    return s;
}

export default function (cid: string, cm: CommandMap): string {
    const elements: { [id: Id]: any } = {};
    const document: any = {
        applyUpdate: function (update: UpdateElement) {
            if (update.children) {
                throw new Error('Not supported (yet): update document children');
            }
            for (const [name, value] of Object.entries(update.sets || {})) {
                if (name !== 'title') {
                    throw new Error(`Not supported (yet): update document's ${name}`);
                }
                this.title = value;
            }
        }
    };
    elements[DOCUMENT] = document;
    elements[BODY] = { id: '', tag: 'body', applyUpdate, ssr };

    for (const ce of cm.createElements || []) {
        elements[ce.id] = { id: ce.id, tag: ce.tag, applyUpdate, ssr };
    }
    for (const [id, update] of Object.entries(cm.updateElements || {})) {
        elements[id].applyUpdate(update);
    }
    elements[BODY].tag = 'body';

    const remainingCm: CommandMap = {
        nextNumber: cm.nextNumber,
        createElements: undefined,
        updateElements: undefined,
        deleteElements: undefined,
        setSignals: cm.setSignals,
        addEffects: cm.addEffects,
        pendingSignals: cm.pendingSignals,
    };

    let s = `
<html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        ${document.title ? `<title>${document.title}</title>` : ''}
    <head>
${elements[BODY].ssr(elements)} 
    <script type="module">
        import '/client.mjs';
        import './index_handlers.mjs';
        globalThis.SOLV_CID = '${cid}';
        solv.applyCommandMap(JSON.parse(\`\n${JSON.stringify(remainingCm)}\n\`));
    </script>
</html>
`

    return s;
}