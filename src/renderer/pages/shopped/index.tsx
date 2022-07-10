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
import { useUpdate } from 'ahooks';
import { EState, shopRegex, TTableData } from './shopped';

import style from './index.module.scss';

export default function Shopped() {
  const isStop = useRef(true);
  const controlProcss = useRef({
    reStartButtonLoading: false,
  });
  const lastOrderIndex = useRef(0);
  const processError = useRef(false);
  const update = useUpdate();
  const currentData = useRef<TTableData[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [waitTime, setWaitTime] = useState(3);
  const [message, setMessage] = useState(
    'Do you want another 50% off slippers, dear?',
  );

  const columns: ColumnProps[] = useMemo(
    () => [
      { title: '订单号', dataIndex: 'orderNumber' },
      { title: '店铺', dataIndex: 'shop' },
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
    [],
  );

  const validate = () => {
    if (!message) {
      Message.warning('请输入需要发送的消息！');
      return false;
    }
    if (!currentData.current.length) {
      Message.warning('请导入订单！');
      return false;
    }
    return true;
  };

  const handleSetErrorCode = () => {
    currentData.current = currentData.current.filter(
      t => t.state === EState.出错 || t.state === EState.未完成,
    );
    console.log(currentData.current);
    processError.current = true;
    update();
  };

  const handleExportData = () => {
    window.electron.onExportFailOrder(
      currentData.current.map(t => ['', t.orderNumber]),
    );
  };

  const handleRestart = () => {
    controlProcss.current.reStartButtonLoading = true;
    window.electron.onRestart();
    window.electron.ipcRenderer.once('onRestart', () => {
      controlProcss.current.reStartButtonLoading = false;
      update();
    });
    update();
  };

  const handleRunAgain = () => {
    isStop.current = false;
    resetLastIndex();
    processOrder();
    update();
  };

  const handleFileDragEnd: DragEventHandler<Element> = event => {
    const filePath = event.dataTransfer.files[0].path;
    window.electron.onDrop(filePath);
  };

  const handleRunAutoScript = () => {
    if (!validate()) return;
    isStop.current = false;
    processOrder();
    update();
  };

  const handleStopAutoScript = () => {
    const currentRow = currentData.current[lastOrderIndex.current];
    isStop.current = true;
    if (currentRow) {
      currentRow.state = EState.未完成;
      currentRow.isLoading = false;
    }
    update();
  };

  const resetTheState = () => {
    if (processError.current) {
      processError.current = false;
      return true;
    }

    if (isStop.current) {
      return true;
    }
    return false;
  };

  // process the order, notice specially the order is one by one
  const processOrder = async () => {
    if (
      isStop.current ||
      lastOrderIndex.current > currentData.current.length - 1
    ) {
      return;
    }
    try {
      const targetOrder = currentData.current[lastOrderIndex.current];
      targetOrder.state = EState.未完成;
      currentData.current[lastOrderIndex.current].isLoading = true;
      window.electron.onRun(
        targetOrder.orderNumber,
        message,
        targetOrder.shop.match(shopRegex)[0],
        waitTime,
      );
      update();

      await new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('onRun', reply => {
          if (reply.state) {
            resetTheState();
            resolve(lastOrderIndex);
          } else {
            if (resetTheState()) {
              return;
            }
            reject(lastOrderIndex);
          }
        });
      });
      targetOrder.isLoading = false;
      targetOrder.state = EState.完成;
      lastOrderIndex.current++;
      update();
      await processOrder();
    } catch (e) {
      console.warn(e instanceof Error && e.message);
      if (isStop.current) {
        return;
      }
      if (!currentData.current[lastOrderIndex.current]) return;
      currentData.current[lastOrderIndex.current].state = EState.出错;
      lastOrderIndex.current++;
      await processOrder();
      update();
    }
  };

  const resetLastIndex = () => {
    lastOrderIndex.current = 0;
  };

  window.electron.ipcRenderer.on('onDrop', (args: { data: [] }) => {
    console.log(args);
    const data = args[0].data
      .slice(1)
      .map<TTableData>((_, index) => ({
        orderNumber: _[1],
        shop: _[3],
        key: index,
        isLoading: false,
        state: EState.未完成,
      }))
      .filter(_ => _.orderNumber);
    currentData.current = data;
    update();
  });

  return (
    <div
      className={style.wrapper}
      onDrop={handleFileDragEnd}
      onDragOver={event => {
        event.preventDefault();
      }}
    >
      <div className={style['operate-area']}>
        <Button
          shape="round"
          type="primary"
          disabled={!isStop.current}
          onClick={handleRunAutoScript}
        >
          运行
        </Button>

        <Button shape="round" type="primary" onClick={handleStopAutoScript}>
          停止
        </Button>

        <Button
          loading={controlProcss.current.reStartButtonLoading}
          shape="round"
          status="warning"
          disabled={!isStop.current}
          onClick={handleRestart}
        >
          重启浏览器
        </Button>

        <Button
          shape="round"
          status="warning"
          disabled={!isStop.current}
          onClick={handleRunAgain}
        >
          重新运行
        </Button>

        {/* <Button shape="round" type="primary" onClick={restart}>
          导出出错订单
        </Button> */}

        <Button
          status="success"
          shape="round"
          onClick={handleSetErrorCode}
          disabled={!isStop.current}
        >
          筛选出错订单
        </Button>

        <Button status="success" shape="round" onClick={handleExportData}>
          导出
        </Button>

        <div className={style['wait-time']}>
          步骤间隔
          <InputNumber
            suffix="s"
            disabled={!isStop.current}
            value={`${waitTime}`}
            onChange={val => {
              setWaitTime(+val);
            }}
          />
        </div>

        <div className={style['message-area']}>
          输入消息：
          <Input
            disabled={!isStop.current}
            className={style['message-input']}
            value={message}
            onChange={value => {
              setMessage(value);
            }}
          />
        </div>
      </div>
      <div className={style.table}>
        <Table
          data={currentData.current}
          columns={columns}
          border
          tableLayoutFixed
          virtualized
          borderCell
          pagination={{
            total: currentData.current.length,
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
