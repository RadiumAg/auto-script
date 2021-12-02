import { render } from 'react-dom';
import '@arco-design/web-react/dist/css/arco.css';
import App from './pages/shopped';
import './assets/css/common.scss';

render(<App />, document.getElementById('root'));

declare global {
  interface Window {
    electron: Record<string, any>;
  }
}
