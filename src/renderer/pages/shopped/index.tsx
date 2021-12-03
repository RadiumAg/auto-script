import { Button, Spin, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { DragEventHandler, useState } from 'react';
import style from './index.module.scss';
import { EState, TTableData } from './shopped';

export default function Shopped() {
  // eslint-disable-next-line prefer-const
  let [isStop, setIsStop] = useState(false);
  // eslint-disable-next-line prefer-const
  let [lastOrderIndex, setLastOrderIndex] = useState(0);
  const [tableData, setTableData] = useState<TTableData[]>([]);
  const colums: ColumnProps[] = [
    { title: '订单号', dataIndex: 'orderNumber' },
    {
      title: '状态',
      width: '120px',
      dataIndex: 'state',
      render: (col, record: TTableData) => {
        console.log(record);
        if (record.state === EState.未完成 && record.isLoading) {
          return (
            <Spin
              className={style.loading}
              loading={record.isLoading}
              tip="运行中"
            >
              <span />
            </Spin>
          );
        }
        if (record.state === EState.出错) {
          return '出错';
        }
        return '未完成';
      },
    },
  ];

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
    tableData[lastOrderIndex].isLoading = false;
    setTableData(tableData.slice());
  };

  async function processOrder() {
    if (isStop || lastOrderIndex === tableData.length - 1) {
      return;
    }
    try {
      setLastOrderIndex(lastOrderIndex);
      const targetOrder = tableData[lastOrderIndex];
      window.electron.onRun(targetOrder.orderNumber);
      tableData[lastOrderIndex].isLoading = true;
      setTableData(tableData.slice());

      await new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('onRun', (reply) => {
          console.log('reply', reply);
          if (reply.state) {
            resolve(lastOrderIndex);
          } else {
            reject(lastOrderIndex);
          }
        });
      });
      targetOrder.isLoading = false;
      targetOrder.state = EState.完成;
      lastOrderIndex++;
      processOrder();
    } catch (e) {
      tableData[lastOrderIndex].state = EState.出错;
      setTableData(tableData.slice());
      lastOrderIndex++;
      processOrder();
    }
  }

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    setTableData(
      args[0].data
        .slice(1)
        .map((_) => ({
          orderNumber: _[1],
          key: _[1],
          isLoading: false,
          state: EState.未完成,
        }))
        .filter((_) => _)
    );
  });

  return (
    <div
      className={style.wrapper}
      onDrop={fileDragEndHandler}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <div className={style['operate-area']}>
        <Button
          style={{
            marginRight: '10px',
          }}
          shape="round"
          type="primary"
          onClick={runAutoScriptHandler}
        >
          运行
        </Button>
        <Button shape="round" type="primary" onClick={stopAutoScriptHandler}>
          停止
        </Button>
      </div>
      <Table data={tableData} columns={colums} />
    </div>
  );
}
