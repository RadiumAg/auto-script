import { Button, Input, Message, Spin, Table } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { DragEventHandler, useRef, useState } from 'react';
import style from './index.module.scss';
import { EState, TTableData } from './shopped';

export default function Shopped() {
  // eslint-disable-next-line prefer-const
  const isStop = useRef(true);
  const lastOrderIndex = useRef(0);
  // eslint-disable-next-line prefer-const
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [stopState, setStopState] = useState(isStop.current);
  const [tableData, setTableData] = useState<TTableData[]>([]);
  const [message, setMessage] = useState('do you play tiktok,dear?');

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
    setStopState(() => {
      isStop.current = false;
      return false;
    });
    resetLastIndex();
    processOrder();
  };

  const fileDragEndHandler: DragEventHandler<Element> = (event) => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  const runAutoScriptHandler = () => {
    if (!message) {
      Message.warning('请输入需要发送的消息！');
      return;
    }
    // resetLastIndex();
    setStopState(() => {
      isStop.current = false;
      return false;
    });
    processOrder();
  };

  const stopAutoScriptHandler = () => {
    setStopState(() => {
      isStop.current = true;
      return true;
    });
    setTableData(tableData.slice());
  };

  async function processOrder() {
    if (isStop.current || lastOrderIndex.current > tableData.length - 1) {
      return;
    }
    try {
      const targetOrder = tableData[lastOrderIndex.current];
      window.electron.onRun(targetOrder.orderNumber, message);
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
          disabled={!stopState}
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

        <div className={style['message-area']}>
          输入消息：
          <Input
            disabled={!stopState}
            className={style['message-input']}
            value={message}
            onChange={(value) => {
              setMessage(value);
            }}
          />
        </div>
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
