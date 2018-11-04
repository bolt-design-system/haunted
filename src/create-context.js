import { contextEvent } from './symbols.js';
import { useState } from './use-state.js';
import { useEffect } from './use-effect.js';
import { useMemo } from './use-memo.js';
import { html, component } from './core.js';

export const createContext = (defaultValue) => {
  const Context = {};

  Context.Provider = component(function (element) {
    const { value } = element;
    const [listeners, setListeners] = useState([]);

    useMemo(() => { // has to trigger updates as soon as possible without extra cycle on provider itself
      listeners.forEach(listener => listener(value));
    }, [value]);

    const unsubscribe = useMemo(() => { // has to add listener as soon as possible
      const eventHandler = (event) => {
        const { detail } = event;
      
        if (detail.Context === Context) {
          detail.value = element.value;
      
          detail.unsubscribe = () => setListeners(listeners.filter(l => l !== detail.callback));

          setListeners([...listeners, detail.callback]);

          event.stopPropagation();
        }
      }

      element.addEventListener(contextEvent, eventHandler);

      return element.removeEventListener.bind(element, contextEvent, eventHandler);
    }, [contextEvent]);

    useEffect(() => unsubscribe, [contextEvent]); // to remove the listener

    return html`<slot></slot>`; // to allow children since shadow is attached
  });

  Context.defaultValue = defaultValue;

  return Context;
}