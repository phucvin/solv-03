export type Id = string;

export type CreateElement = {
    id: Id,
    tag: string,
};

export type CommandMap = {
    createElements: CreateElement[],
    deleteDelements: Id[],
    updateElements: { [key: Id] : UpdateElement },
    setSignals: { [key: Id]: any },
};

export type UpdateElement = {
    setValues: { [key: string]: any },
    removeValues: string[],
    setChildren: Id[] | undefined,
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