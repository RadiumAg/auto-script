import { useMemoizedFn } from 'ahooks';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { DragEventHandler, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Message,
  Spin,
  Table,
} from '@arco-design/web-react';
import { EState, TTableData } from './shopped';

import style from './index.module.scss';

export default function Shopped() {
  const isStop = useRef(true);
  const again = useRef(false);
  const lastOrderIndex = useRef(0);
  const isProcessError = useRef(false);
  const currentData = useRef<TTableData[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [waitTime, setWaitTime] = useState(3);
  const [stopState, setStopState] = useState(isStop.current);
  const [tableData, setTableData] = useState<TTableData[]>([]);
  const [message, setMessage] = useState('do you play tiktok,dear?');

  const colums: ColumnProps[] = useMemo(
    () => [
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
              />
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
    ],
    []
  );

  const setErrorCodeHandler = useMemoizedFn(() => {
    setTableData(
      tableData.filter((t) => t.state === EState.出错 || EState.未完成)
    );
    isProcessError.current = true;
  });

  const resetAgain = useMemoizedFn(() => {
    setStopState(() => {
      return false;
    });
    isStop.current = false;
    again.current = true;
    resetLastIndex();
    processOrder();
  });

  const fileDragEndHandler: DragEventHandler<Element> = useMemoizedFn(
    (event) => {
      const filePath = event.dataTransfer.files[0].path;
      window.electron.onDrop(filePath);
    }
  );

  const runAutoScriptHandler = useMemoizedFn(() => {
    if (!message) {
      Message.warning('请输入需要发送的消息！');
      return;
    }
    // resetLastIndex();
    isStop.current = false;
    setStopState(false);
    processOrder();
  });

  const stopAutoScriptHandler = useMemoizedFn(() => {
    setStopState(true);
    isStop.current = true;
    tableData[lastOrderIndex.current].state = EState.未完成;
    tableData[lastOrderIndex.current].isLoading = false;
    console.log(tableData[lastOrderIndex.current].state);
    setTableData(tableData.slice());
  });

  const processOrder = useMemoizedFn(async () => {
    if (isStop.current || lastOrderIndex.current > tableData.length - 1) {
      return;
    }
    try {
      const targetOrder = tableData[lastOrderIndex.current];
      targetOrder.state = EState.未完成;
      tableData[lastOrderIndex.current].isLoading = true;
      window.electron.onRun(
        targetOrder.orderNumber,
        message,
        waitTime,
        again.current
      );
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
      if (isStop.current) {
        return;
      }

      if (isProcessError.current) {
        isProcessError.current = false;
        return;
      }

      if (again.current) {
        again.current = false;
      }

      if (!tableData[lastOrderIndex.current]) return;
      tableData[lastOrderIndex.current].state = EState.出错;
      setTableData(tableData.slice());
      lastOrderIndex.current++;
      processOrder();
    }
  });

  const resetLastIndex = useMemoizedFn(() => {
    lastOrderIndex.current = 0;
  });

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    const data = args[0].data
      .slice(1)
      .map<TTableData>((_) => ({
        orderNumber: _[1],
        key: _[1],
        isLoading: false,
        state: EState.未完成,
      }))
      .filter((_) => _.orderNumber);
    setTableData(data);
    currentData.current = data;
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
          shape="round"
          type="primary"
          disabled={!stopState}
          onClick={runAutoScriptHandler}
        >
          运行
        </Button>

        <Button
          shape="round"
          type="primary"
          disabled={stopState}
          onClick={stopAutoScriptHandler}
        >
          停止
        </Button>

        <Button
          shape="round"
          status="warning"
          disabled={!stopState}
          onClick={resetAgain}
        >
          重新运行
        </Button>

        {/* <Button shape="round" type="primary" onClick={resetAgain}>
          导出出错订单
        </Button> */}

        <Button
          status="success"
          shape="round"
          onClick={setErrorCodeHandler}
          disabled={!stopState}
        >
          筛选出错订单
        </Button>

        <div className={style['wait-time']}>
          步骤间隔
          <InputNumber
            suffix="s"
            disabled={!stopState}
            value={`${waitTime}`}
            onChange={(val) => {
              setWaitTime(+val);
            }}
          />
        </div>

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
      </div>
      <div className={style.table}>
        <Table
          data={tableData}
          columns={colums}
          border
          tableLayoutFixed
          virtualized
          borderCell
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
    </div>
  );
}
