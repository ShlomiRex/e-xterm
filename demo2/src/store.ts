import Store from 'electron-store';

const store = new Store();
store.set('unicorn', '🦄');
console.log(store.get('unicorn'));

//give permission for renderer process to use electron-store
Store.initRenderer();
