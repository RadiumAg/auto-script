import Shopped from './pages/shopped';
import { createRoot } from 'react-dom/client';
import './assets/css/common.scss';
import '@arco-design/web-react/dist/css/arco.css';

const container = createRoot(document.querySelector('#root'));

container.render(<Shopped />);

declare global {
  interface Window {
    electron: Record<string, any>;
  }
}
