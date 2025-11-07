const mem = new Map<string, any>();
let nextCid = 1;

export let TTL_SECONDS = 10;

function ttl(cid: string) {
    setTimeout(() => {
        console.log('Clearing cache for cid', cid, 'data', mem.get(cid));
        mem.delete(cid);
    }, TTL_SECONDS * 1000)
}

export async function insert(data: any) {
    const cid = (nextCid++).toString();
    mem.set(cid, data);
    ttl(cid);
    return cid;
}


export async function get(cid: string) {
    if (!mem.has(cid)) {
        throw new Error(`CID not in cache to get: ${cid}`);
    }
    return mem.get(cid);
}

export async function update(cid: string, data : any) {
    mem.set(cid, data);
    ttl(cid);
}