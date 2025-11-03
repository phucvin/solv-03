export type Id = string;
export type HasId = { id: string };

export type StaticId = string;

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
    deleteDelements: Id[] | undefined,
    updateElements: { [id: Id] : UpdateElement } | undefined,
    setSignals: { [id: Id]: any } | undefined,
    addEffects: { [elementId: Id]: AddEffect[] } | undefined,
};

export type UpdateElement = {
    sets: { [key: string]: any } | undefined,
    children: Id[] | undefined,
};

export const DOCUMENT = '$document';
export const BODY = '$body';

export default {};