const mem = new Map<number, any>();
let nextCid = 1;

export let TTL_SECONDS = 10;

function ttl(cid: number) {
    setTimeout(() => {
        console.log('Clearing cache for cid', cid, 'data', mem.get(cid));
        mem.delete(cid);
    }, TTL_SECONDS * 1000)
}

export async function insert(data: any) {
    const cid = nextCid++;
    mem.set(cid, data);
    ttl(cid);
    return cid;
}


export async function get(cid: number) {
    if (!mem.has(cid)) {
        throw new Error(`CID not in cache to get: ${cid}`);
    }
    return mem.get(cid);
}

export async function update(cid: number, data : any) {
    mem.set(cid, data);
    ttl(cid);
}