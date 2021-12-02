import { Table } from '@arco-design/web-react';
import './index.scss';

export default function App() {
  const colums = [{ title: '订单号', dataIndex: 'orderNumber' }];
  return (
    <div className="wrapper">
      <Table columns={colums} />
    </div>
  );
}
