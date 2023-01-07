import Shopped from './pages/Main';
import { createRoot } from 'react-dom/client';
import './assets/css/common.scss';

const container = createRoot(document.querySelector('#root'));

container.render(<Shopped />);

declare global {
  interface Window {
    electron: Record<string, any>;
  }
}
