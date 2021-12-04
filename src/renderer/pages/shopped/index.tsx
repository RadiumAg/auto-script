import { Button, Spin, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { DragEventHandler, useRef, useState } from 'react';
import style from './index.module.scss';
import { EState, TTableData } from './shopped';

export default function Shopped() {
  // eslint-disable-next-line prefer-const
  const isStop = useRef(false);
  // eslint-disable-next-line prefer-const
  const lastOrderIndex = useRef(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [tableData, setTableData] = useState<TTableData[]>([]);

  const colums: ColumnProps[] = [
    { title: '订单号', dataIndex: 'orderNumber' },
    {
      title: '状态',
      width: '120px',
      dataIndex: 'state',
      render: (col, record: TTableData) => {
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
        } else if (record.state === EState.出错) {
          return EState[record.state];
        } else if (record.state === EState.完成) {
          return EState[record.state];
        } else {
          return EState[record.state];
        }
      },
    },
  ];

  const resetAgain = () => {
    isStop.current = false;
    resetLastIndex();
    processOrder();
  };

  const fileDragEndHandler: DragEventHandler<Element> = (event) => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  const runAutoScriptHandler = () => {
    // resetLastIndex();
    isStop.current = false;
    processOrder();
  };

  const stopAutoScriptHandler = () => {
    isStop.current = true;
    setTableData(tableData.slice());
  };

  async function processOrder() {
    if (isStop.current || lastOrderIndex.current > tableData.length - 1) {
      return;
    }
    try {
      const targetOrder = tableData[lastOrderIndex.current];
      window.electron.onRun(targetOrder.orderNumber);
      targetOrder.state = EState.未完成;
      tableData[lastOrderIndex.current].isLoading = true;
      setTableData(tableData.slice());

      await new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('onRun', (reply) => {
          if (reply.state) {
            resolve(lastOrderIndex);
          } else {
            reject(lastOrderIndex);
          }
        });
      });
      targetOrder.isLoading = false;
      targetOrder.state = EState.完成;
      setTableData(tableData.slice());
      lastOrderIndex.current++;
      processOrder();
    } catch (e) {
      tableData[lastOrderIndex.current].state = EState.出错;
      setTableData(tableData.slice());
      lastOrderIndex.current++;
      processOrder();
    }
  }

  function resetLastIndex() {
    lastOrderIndex.current = 0;
  }

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    setTableData(
      args[0].data
        .slice(1)
        .map<TTableData>((_) => ({
          orderNumber: _[1],
          key: _[1],
          isLoading: false,
          state: EState.未完成,
        }))
        .filter((_) => _.orderNumber)
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
          disabled={!isStop}
          onClick={runAutoScriptHandler}
        >
          运行
        </Button>
        <Button
          style={{
            marginRight: '10px',
          }}
          shape="round"
          type="primary"
          onClick={stopAutoScriptHandler}
        >
          停止
        </Button>
        {/* <Button shape="round" type="primary" onClick={resetAgain}>
          重新运行
        </Button> */}
      </div>
      <Table
        data={tableData}
        columns={colums}
        border
        borderCell
        style={{
          flex: 1,
        }}
        pagination={{
          total: tableData.length,
          current: pageIndex,
          sizeCanChange: true,
          pageSize,
          onChange(pageNumber, size) {
            setPageSize(size);
            setPageIndex(pageNumber);
          },
        }}
      />
    </div>
  );
}
