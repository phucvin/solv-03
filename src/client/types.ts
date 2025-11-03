export type Id = string;

export type CreateElement = {
    id: Id,
    tag: string,
};

export type CommandMap = {
    createElements: CreateElement[],
    deleteDelements: Id[],
    updateElements: Map<Id, UpdateElement>,
    setSignals: Map<Id, any>,
};

export type UpdateElement = {
    addOrUpdateValues: Map<string, any> | null,
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