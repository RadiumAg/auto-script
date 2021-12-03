import { render } from 'react-dom';
import Shopped from './pages/shopped';
import './assets/css/common.scss';
import '@arco-design/web-react/dist/css/arco.css';

render(<Shopped />, document.getElementById('root'));

declare global {
  interface Window {
    electron: Record<string, any>;
  }
}
