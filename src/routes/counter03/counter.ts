import { registerSharedComponent, registerSharedHandler } from "../../server";
import { Id, Element, Solv, Signal } from "../../shared";

const eTxt = registerSharedHandler((countId: Id, countTxtId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const countTxt = solv.getElement(countTxtId);
    countTxt.set('innerHTML', `${count.get()}`);
});

const eReset = registerSharedHandler((countId: Id, resetBtnId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    const resetBtn = solv.getElement(resetBtnId);
    if (count.get() <= 0) {
        resetBtn.set('disabled', 1);
    } else {
        resetBtn.set('disabled', null);
    }
});

const aInc = registerSharedHandler((countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(count.get() + 1);
});

const aReset = registerSharedHandler((countId: Id, solv: Solv) => {
    const count = solv.getSignal(countId);
    count.set(0);
});

async function Counter({ count }: { count: Signal }, solv: Solv): Promise<Element> {
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

    const resetBtn = solv.newElement('button');
    resetBtn.set('class', 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-2xl disabled:opacity-50 disabled:cursor-not-allowed');
    resetBtn.set('innerHTML', 'reset');
    resetBtn.set('onclick', { handler: aReset, params: [count.id] });
    solv.addEffect(eReset, [count.id, resetBtn.id]);

    main.setChildren([title, countTxt, incBtn, resetBtn]);
    return main;
}

registerSharedComponent(
    'import_counter',
    Counter.toString()
        .replaceAll('eTxt', `'${eTxt}'`)
        .replaceAll('eReset', `'${eReset}'`)
        .replaceAll('aInc', `'${aInc}'`)
        .replaceAll('aReset', `'${aReset}'`));

export default Counter;