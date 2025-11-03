import { registerSharedComponent, registerSharedHandler } from "../../server";
import { Id, Element, Solv, Signal } from "../../shared";

const eTxt = registerSharedHandler((countId: Id, countTxtId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const countTxt = solv.getElement(countTxtId);
    countTxt.set('innerHTML', `${count.get()}`);
});

const eDelete = registerSharedHandler((countId: Id, deleteBtnId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const deleteBtn = solv.getElement(deleteBtnId);
    if (count.get() >= 10) {
        deleteBtn.set('disabled', 1);
    } else {
        deleteBtn.set('disabled', null);
    }
});

const aInc = registerSharedHandler((countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(count.get() + 1);
});

const aDelete = registerSharedHandler((countId: Id, deleteId: Id, solv: Solv) => {
    const delete_ = solv.getSignal(deleteId);
    delete_.set((delete_.get() || []).concat([countId]));
});

async function Counter({ count, delete_ }: { count: Signal, delete_: Signal }, solv: Solv): Promise<Element> {
    const main = solv.newElement('div');
    main.set('class', 'bg-white p-8 rounded-lg shadow-md flex flex-col items-center space-x-4 space-y-4');

    const title = solv.newElement('h1');
    title.set('class', 'text-3xl font-bold mb-4');
    title.set('innerHTML', 'Counter');

    const countTxt = solv.newElement('span');
    countTxt.set('class', 'text-5xl font-semibold text-gray-800');
    solv.addEffect(eTxt, [count.id, countTxt.id]);

    const incBtn = solv.newElement('button');
    incBtn.set('class', 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-2xl');
    incBtn.set('innerHTML', 'inc');
    incBtn.set('onclick', { handler: aInc, params: [count.id] });

    const deleteBtn = solv.newElement('button');
    deleteBtn.set('class', 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-2xl disabled:opacity-50 disabled:cursor-not-allowed');
    deleteBtn.set('innerHTML', 'del');
    deleteBtn.set('onclick', { handler: aDelete, params: [count.id, delete_.id] });
    solv.addEffect(eDelete, [count.id, deleteBtn.id]);

    const tmpTxt = solv.newElement('input');
    tmpTxt.set('type', 'text');
    tmpTxt.set('class', 'bg-gray-50 border border-gray-300 text-center');

    main.setChildren([title, countTxt, incBtn, deleteBtn, tmpTxt]);
    return main;
}

registerSharedComponent(
    'import_counter',
    Counter.toString()
        .replaceAll(/eTxt.*?,/g, `'${eTxt}',`)
        .replaceAll(/eDelete.*?,/g, `'${eDelete}',`)
        .replaceAll(/aInc.*?,/g, `'${aInc}',`)
        .replaceAll(/aDelete.*?,/g, `'${aDelete}',`));

export default Counter;