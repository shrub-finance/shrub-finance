import { useEffect, useState } from 'react';

export const createEmitter = () => {
    const subscriptions = new Map();
    return {
        emit: (v: any) => subscriptions.forEach(fn => fn(v)),
        subscribe: (fn: any) => {
            const key = Symbol();
            subscriptions.set(key, fn);
            return () => subscriptions.delete(key);
        },
    }
};

export const createStore = (init: any) => {
    // create an emitter
    const emitter = createEmitter();

    let store: any = null;
    const get = () => store;
    const set = (op: any) => (
        store = op(store),
            // notify all subscriptions when the store updates
            emitter.emit(store)
    );
    store = init(get, set);

    const useStore = () => {
        // intitialize component with latest store
        const [localStore, setLocalStore] = useState(get());

        // update our local store when the global
        // store updates.
        //
        // emitter.subscribe returns a cleanup
        // function, so react will clean this
        // up on unmount.
        // @ts-ignore
        useEffect(() => emitter.subscribe(setLocalStore), []);
        return localStore;
    };
    return useStore;
};