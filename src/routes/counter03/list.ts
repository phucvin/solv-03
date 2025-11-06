import { Element, Solv, Signal } from "../../shared";
import { eMain } from "./list_handlers";

export default async function ({ counterMap } : { counterMap: Signal }, solv: Solv): Promise<Element> {
    const main = solv.newElement('div');
    main.set('class', 'space-y-4');
    solv.addEffect(eMain, [ counterMap.id, main.id ]);
    return main;
}