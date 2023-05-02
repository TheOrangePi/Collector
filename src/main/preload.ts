// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ICollection} from 'main/defintions/LibraryModel'

contextBridge.exposeInMainWorld('library', {
  CRUDLibrary: (operation : any, collectionId: any, arg:any) => ipcRenderer.invoke("CRUDLibrary", {operation, collectionId, arg}),
  SearchLibrary: (itemType: any, searchTerm: any) => ipcRenderer.invoke("SearchLibrary", {itemType, searchTerm}),
  CRUDItem: (operation: any, collectionId: any, arg:any) => ipcRenderer.invoke("CRUDItem", {operation, collectionId, arg}),
});

// export type Channels = 'ipc-example';

// const electronHandler = {
//   ipcRenderer: {
//     sendMessage(channel: Channels, args: unknown[]) {
//       ipcRenderer.send(channel, args);
//     },
//     on(channel: Channels, func: (...args: unknown[]) => void) {
//       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
//         func(...args);
//       ipcRenderer.on(channel, subscription);

//       return () => {
//         ipcRenderer.removeListener(channel, subscription);
//       };
//     },
//     once(channel: Channels, func: (...args: unknown[]) => void) {
//       ipcRenderer.once(channel, (_event, ...args) => func(...args));
//     },
//   },
// };

//contextBridge.exposeInMainWorld('electron', electronHandler);

//export type ElectronHandler = typeof electronHandler;
