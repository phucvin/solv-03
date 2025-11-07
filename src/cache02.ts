import { randomUUID } from 'crypto';

// @ts-ignore
const cache = caches.default;

const toRequest = (cid: string) => new Request(`http://${cid}`);

export async function insert(data: any) {
    const cid = randomUUID();
    await cache.put(toRequest(cid), new Response(JSON.stringify(data)));
    return cid;
}


export async function get(cid: string) {
    const data = await cache.match(toRequest(cid));
    if (data === undefined) {
        throw new Error(`CID not in cache to get: ${cid}`);
    }
    return data.json();
}

export function update(cid: string, data: any) {
    return cache.put(toRequest(cid), new Response(JSON.stringify(data)));
}