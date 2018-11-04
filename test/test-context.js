import { component, html, createContext, useContext, useState } from '../web.js';
import { attach, cycle } from './helpers.js';

describe('context', function() {
  const defaultValue = 'halloween';
  const Context = createContext(defaultValue);
  
  let contexts = new WeakMap();
  function Consumer(element) {
    const context = useContext(Context);
    
    contexts.set(element, context);
    
    return html`${context}`;
  }

  customElements.define('context-consumer', component(Consumer));

  customElements.define('context-provider', Context.Provider);

  let withProviderValue, withProviderUpdate;
  let rootProviderValue, rootProviderUpdate, nestedProviderValue, nestedProviderUpdate;

  function Tests() {
    [withProviderValue, withProviderUpdate] = useState();
    [rootProviderValue, rootProviderUpdate] = useState('root');
    [nestedProviderValue, nestedProviderUpdate] = useState('nested');
    
    return html`
      <div id="without-provider">
        <context-consumer></context-consumer>
      </div>

      <div id="with-provider">
        <context-provider .value=${withProviderValue}>
          <context-consumer></context-consumer>
        </context-provider>
      </div>

      <div id="nested-providers">
        <context-provider .value=${rootProviderValue}>
          <context-consumer></context-consumer>
          <context-provider .value=${nestedProviderValue}>
            <context-consumer></context-consumer>
          </context-provider>
        </context-provider>
      </div>
    `;
  }

  const testTag = 'context-tests';

  customElements.define(testTag, component(Tests));
  
  function getResults(id) {
    return [...host.querySelector('context-tests').shadowRoot.querySelectorAll(`#${id} context-consumer`)].map(consumer => contexts.get(consumer));
  }

  let teardown;
  beforeEach(async () => {
    teardown = attach(testTag);
    await cycle();
  });

  afterEach(() => {
    teardown();
  });

  it('uses defaultValue when provider is not found', () => {
    assert.equal(getResults('without-provider')[0], defaultValue);
  });

  it('uses providers value when provider is found', async () => {
    withProviderUpdate('spooky');
    await cycle();
    await cycle();
    assert.equal(getResults('with-provider')[0], 'spooky');
  });

  it('uses providers value when provider is found even if it is undefined', () => {
    assert.equal(getResults('with-provider')[0], undefined);
  });

  it('uses closest provider ancestor\'s value', () => {
    assert.deepEqual(getResults('nested-providers'), ['root', 'nested']);
  });
});