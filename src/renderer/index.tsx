import { ConfigData } from 'main/config';
import { createRoot } from 'react-dom/client';
import './assets/css/common.scss';
import Shopped from './pages/Main';

const container = createRoot(document.querySelector('#root'));

container.render(<Shopped />);

declare global {
  interface Window {
    electron: {
      onDrop: (file: string) => void;
      onRun: (
        orderId: string,
        message: string,
        shop: string,
        waitTime: number,
      ) => void;
      onOpenFileDialog: () => void;
      onRestart: () => void;
      getConfig: () => void;
      onSheetSelect: (sheetName: string) => void;
      setConfing: (config: ConfigData) => void;
      onMarkOrgin: (orderId: string, state: string) => void;
      onExportFailOrder: (orderNumbers: [string, string][]) => void;
      ipcRenderer: {
        on: (channel: string, func: (...args) => any) => void;
        once: (channel: string, func: (...args) => any) => void;
      };
    };
  }
}
