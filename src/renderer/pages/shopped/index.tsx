import { Button, Table } from '@arco-design/web-react';
import { DragEventHandler, useState } from 'react';
import './index.scss';

export default function App() {
  const colums = [{ title: '订单号', dataIndex: 'orderNumber' }];
  const [tableData, setTableData] = useState<{ orderNumber: string }[]>([]);
  const [isStop, setIsStop] = useState<boolean>(false);
  const fileDragEndHandler: DragEventHandler<Element> = (event) => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  const runAutoScriptHandler = async () => {
    setIsStop(true);
    window.electron.onRun(true);
  };

  const stopAutoScriptHandler = async () => {
    setIsStop(false);
    window.electron.onRun(false);
  };

  async function processOrder(orderId: string) {
    try {
    } catch (e) {}
  }

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    setTableData(args[0].data.slice(1).map((_) => ({ orderNumber: _[1] })));
  });

  return (
    <div
      className="wrapper"
      onDrop={fileDragEndHandler}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <div className="operate-area">
        <Button
          style={{
            marginRight: '10px',
          }}
          shape="round"
          type="primary"
          onClick={runAutoScriptHandler}
        >
          Run
        </Button>
        <Button shape="round" type="primary" onClick={stopAutoScriptHandler}>
          Stop
        </Button>
      </div>
      <Table data={tableData} columns={colums} />
    </div>
  );
}
