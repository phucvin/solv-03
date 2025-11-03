export type Id = string;
export type HasId = { id: string };

export type StaticId = string;

export type Element = {
    id: Id,
    set: (name: string, value: any) => void,
    setChildren: (children: (HasId | Id)[]) => void,
};

export type Signal = {
    id: Id,
    get: () => any,
    set: (newValue: any) => void,
};

export type Solv = {
    newElement: (tag: string) => Element,
    newSignal: (initialValue: any) => Signal,
    getElement: (id: Id) => Element,
    getSignal: (id: Id) => Signal,
    addEffect: (element: Element, handler: StaticId, params: any[]) => void,
};

export type CreateElement = {
    id: Id,
    tag: string,
};

export type AddEffect = {
    handler: Id,
    params: Id[],
};

export type CommandMap = {
    nextNumber: number | undefined,
    createElements: CreateElement[] | undefined,
    updateElements: { [id: Id] : UpdateElement } | undefined,
    deleteDelements: Id[] | undefined,
    setSignals: { [id: Id]: any } | undefined,
    addEffects: { [elementId: Id]: AddEffect[] } | undefined,
    pendingSignals: { [id: Id]: number } | undefined,
};

export type UpdateElement = {
    sets: { [key: string]: any } | undefined,
    children: Id[] | undefined,
};

export const DOCUMENT = '$document';
export const BODY = '$body';

export default {};