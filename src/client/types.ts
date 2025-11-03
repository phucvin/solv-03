export type Id = string;

export type CreateElement = {
    id: Id,
    tag: string,
};

export type AddEffect = {
    handler: Id,
    params: Id[],
};

export type CommandMap = {
    nextNumber: number | null,
    createElements: CreateElement[] | null,
    deleteDelements: Id[] | null,
    updateElements: { [id: Id] : UpdateElement } | null,
    setSignals: { [id: Id]: any } | null,
    addEffects: { [elementId: Id]: AddEffect[] } | null,
};

export type UpdateElement = {
    setValues: { [key: string]: any } | null,
    removeValues: string[] | null,
    setChildren: Id[] | null,
};

export type Element = {
    id: Id,
    applyUpdate: (update: UpdateElement) => void,
};

export type Signal = {
    id: Id,
    currentValue: any,
    set: (newValue: any) => void,
};

export default {};