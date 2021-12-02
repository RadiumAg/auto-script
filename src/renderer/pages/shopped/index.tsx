import { Table } from '@arco-design/web-react';
import { DragEventHandler } from 'react';
import './index.scss';

export default function App() {
  const colums = [{ title: '订单号', dataIndex: 'orderNumber' }];

  const fileDragEndHandler: DragEventHandler<Element> = (event) => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  return (
    <div
      className="wrapper"
      onDrop={fileDragEndHandler}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <Table columns={colums} />
    </div>
  );
}
