const mem = new Map<number, any>();
let nextCid = 1;

export async function insert(data: any) {
    const cid = nextCid++;
    mem.set(cid, data);
    return cid;
}


export async function get(cid: number) {
    if (!mem.has(cid)) {
        throw new Error(`CID not in cache to get: ${cid}`);
    }
    return mem.get(cid);
}

export async function update(cid: number, data : any) {
    if (!mem.has(cid)) {
        throw new Error(`CID not in cache to update: ${cid}`);
    }
    mem.set(cid, data);
}