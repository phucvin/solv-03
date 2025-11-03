
    let repeats = 5;
    while (Object.keys(cm.pendingSignals).length > 0 && --repeats > 0) {
        for (const signalId in cm.pendingSignals) {
            for (const elementId in cm.addEffects) {
                for (const addEffect of cm.addEffects[elementId]) {
                    addEffect.
                    let handler = registeredServerHandlers[addEffect.handler];
                    if (!handler) {
                        handler = registerSharedHandler[addEffect.handler];
                    }
                    if (!handler) {
                        throw new Error(`Handler not found whil processing pending signals`);
                    }
                }
            }
        }
    }
    if (repeats <= 0) {
        throw new Error('Too many repeats processing pending signals');
    }

