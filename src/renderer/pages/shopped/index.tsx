import { Button, Table } from '@arco-design/web-react';
import { DragEventHandler, useState } from 'react';
import './index.scss';

export default function App() {
  // eslint-disable-next-line prefer-const
  let [isStop, setIsStop] = useState(false);
  // eslint-disable-next-line prefer-const
  let [lastOrder, setLastOrder] = useState('');
  const [tableData, setTableData] = useState<{ orderNumber: string }[]>([]);
  const colums = [{ title: '订单号', dataIndex: 'orderNumber' }];
  const fileDragEndHandler: DragEventHandler<Element> = (event) => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  const runAutoScriptHandler = async () => {
    setIsStop(false);
    isStop = false;
    processOrder();
  };

  const stopAutoScriptHandler = async () => {
    isStop = true;
    setIsStop(true);
  };

  async function processOrder() {
    if (isStop) {
      return;
    }
    try {
      lastOrder = tableData[0].orderNumber;
      setLastOrder(lastOrder);
      window.electron.onRun(lastOrder);

      await new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('onRun', (reply) => {
          console.log('reply', reply);
          if (reply.state) {
            resolve(lastOrder);
          } else {
            reject(lastOrder);
          }
        });
      });

      processOrder();
    } catch (e) {
      isStop = true;
      setIsStop(true);
    }
  }

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    setTableData(
      args[0].data.slice(1).map((_) => ({ orderNumber: _[1], key: _[1] }))
    );
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
