import { registerSharedActionHandler, registerSharedEffectHandler } from "../../registry";
import { Id, Solv } from "../../shared";

export const eTxt = registerSharedEffectHandler('ah',
    (countId: Id, countTxtId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const countTxt = solv.getElement(countTxtId);
        countTxt.set('innerHTML', `${count.get()}`);
    });

export const eDelete = registerSharedEffectHandler('ai',
    (countId: Id, deleteBtnId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        const deleteBtn = solv.getElement(deleteBtnId);
        if (count.get() >= 10) {
            deleteBtn.set('disabled', 1);
        } else {
            deleteBtn.set('disabled', null);
        }
    });

export const aInc = registerSharedActionHandler('aj',
    (countId: Id, solv: Solv) => {
        const count = solv.getSignal(countId);
        count.set(count.get() + 1);
    });

export const aDelete = registerSharedActionHandler('ak',
    (countId: Id, deleteId: Id, solv: Solv) => {
        const delete_ = solv.getSignal(deleteId);
        delete_.set((delete_.get() || []).concat([countId]));
    });
