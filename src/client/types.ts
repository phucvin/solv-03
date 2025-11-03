export type Id = string;

export type CreateElement = {
    id: Id,
    tag: string,
};

export type AddEffect = {
    handlerId: Id,
    params: Id[],
};

export type CommandMap = {
    nextNumber: number,
    createElements: CreateElement[],
    deleteDelements: Id[],
    updateElements: { [id: Id] : UpdateElement },
    setSignals: { [id: Id]: any },
    addEffects: { [elementId: Id]: AddEffect[] },
};

export type UpdateElement = {
    setValues: { [key: string]: any },
    removeValues: string[],
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