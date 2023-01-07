import Shopped from './pages/Main';
import { createRoot } from 'react-dom/client';
import './assets/css/common.scss';
import { ConfigData } from 'main/config';

const container = createRoot(document.querySelector('#root'));

container.render(<Shopped />);

declare global {
  interface Window {
    electron: {
      onDrop: (file: File) => void;
      onRun: (
        orderId: string,
        message: string,
        shop: string,
        waitTime: number,
      ) => void;
      onOpenFileDialog: () => void;
      onRestart: () => void;
      getConfig: () => void;
      setConfing: (config: ConfigData) => void;
      ipcRenderer: {
        on: (channel: string, func: (event, ...args) => any) => void;
        once: (channel: string, func: (event, ...args) => any) => void;
      };
    };
  }
}
