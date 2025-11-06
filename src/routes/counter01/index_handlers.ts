import { registerActionHandler, registerEffectHandler } from "../../registry";
import { Id, Solv } from "../../shared";

export const eTxt = registerEffectHandler('aa',
    (countId: Id, countTxtId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const countTxt = solv.getElement(countTxtId);
        countTxt.set('innerHTML', `${count.get()}`);
    });

export const aInc = registerActionHandler('ab',
    (countId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        count.set(count.get() + 1);
    });
