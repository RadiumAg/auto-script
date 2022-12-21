import { ColumnProps } from '@arco-design/web-react/es/Table';
import { DragEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Message,
  Spin,
  Table,
} from '@arco-design/web-react';
import { useMount, useUpdate } from 'ahooks';
import { EState, processShopName, shopRegex, TableData } from './shopped';

import style from './index.module.scss';

export default function Shopped() {
  const isStop = useRef(true);
  const controlProcss = useRef({
    reStartButtonLoading: false,
  });
  const lastOrderIndex = useRef(0);
  const processError = useRef(false);
  const update = useUpdate();
  const tableWrapper = useRef<HTMLDivElement>();
  const currentData = useRef<TableData[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [waitTime, setWaitTime] = useState(3);
  const [message, setMessage] = useState('');

  const [data, setData] = useState({
    tableY: 0,
    fileName: '',
  });

  const adjustTableY = useRef(() => {
    const { height } = tableWrapper.current.getBoundingClientRect();
    setData(oldData => {
      const newData = { ...oldData };
      newData.tableY = height - 100;
      return newData;
    });
  });

  const columns: ColumnProps[] = useMemo(
    () => [
      { title: '订单号', dataIndex: 'orderNumber' },
      { title: '店铺', dataIndex: 'shop' },
      {
        title: '状态',
        width: '120px',
        dataIndex: 'state',
        render: (col, record: TableData) => {
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
      t => t.state === EState.出错,
    );
    processError.current = true;
    setPageIndex(1);
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
    const file = event.dataTransfer.files[0];
    setData(oldData => {
      const newData = { ...oldData };
      newData.fileName = file.name;
      return newData;
    });
    window.electron.onDrop(file.path);
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
        processShopName(targetOrder.shop.match(shopRegex)[0]),
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
    const excelData: TableData[] = args[0].data
      .slice(1)
      .map<TableData>((_, index) => ({
        orderNumber: _[1],
        shop: _[3],
        key: index,
        isLoading: false,
        state: EState.未完成,
      }))
      .filter(_ => _.orderNumber);

    if (excelData[0].shop) {
      currentData.current = excelData.sort((a, b) =>
        a.shop.localeCompare(b.shop),
      );
    } else {
      currentData.current = excelData;
    }
    update();
  });

  useEffect(() => {
    window.addEventListener('resize', adjustTableY.current);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      window.removeEventListener('resize', adjustTableY.current);
    };
  }, []);

  useMount(() => {
    adjustTableY.current();
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
          步骤间隔：
          <InputNumber
            suffix="s"
            disabled={!isStop.current}
            value={`${waitTime}`}
            onChange={val => {
              setWaitTime(+val);
            }}
          />
        </div>
      </div>

      <div className={style['file-info']}>文件名称：{data.fileName}</div>

      <div className={style['message-area']}>
        输入消息：
        <Input.TextArea
          rows={4}
          disabled={!isStop.current}
          className={style['message-input']}
          value={message}
          onChange={value => {
            setMessage(value);
          }}
        />
      </div>

      <div ref={tableWrapper} className={style.table}>
        <Table
          data={currentData.current}
          columns={columns}
          scroll={{
            y: data.tableY,
          }}
          style={{
            height: '100%',
          }}
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
