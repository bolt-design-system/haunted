import { useEffect } from './use-effect.js';
import { useState } from './use-state.js';
import { useMemo } from './use-memo.js';
import { current } from './interface.js';
import { contextEvent } from './symbols.js';

export const useContext = (Context) => {
  const [context, setContext] = useState();
  let contextValue = context;

  const unsubscribe = useMemo(() => { // has to synchronous
    const detail = { Context, callback: setContext }; // setContext sucks because causes extra cycle

    current.dispatchEvent(new CustomEvent(contextEvent, {
      detail, // carrier
      bubbles: true, // to bubble up in tree
      cancelable: true, // to be able to cancel
      composed: true, // to pass ShadowDOM boundaries
    }));

    const { unsubscribe, value } = detail;

    contextValue = unsubscribe ? value : Context.defaultValue; // ugly

    return unsubscribe;
  }, [contextEvent]);

  useEffect(() => unsubscribe, [contextEvent]); // to unsubscribe

  return contextValue;
}