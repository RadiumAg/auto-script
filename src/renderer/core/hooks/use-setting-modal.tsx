import { Modal } from 'antd';
import { useConfig } from './use-config';
import { createContext, useRef } from 'react';
import { ConfigData } from 'main/config';

const configContext = createContext<ConfigData>({});

export const useSettingModal = () => {
  const [config, setConfig] = useConfig();
  const [modal, contextHolder] = Modal.useModal();
  const modalRef = useRef<ReturnType<typeof modal.info>>();

  const handleOpenFileDialog = () => {
    window.electron.onOpenFileDialog();
    window.electron.ipcRenderer.on(
      'onOpenFileDialog',
      ([filePath]: string[]) => {
        setConfig({ multipleFilePath: filePath });
        modalRef.current.update(modalInfoConfig);
      },
    );
  };

  const modalInfoConfig = {
    title: '配置',
    content: (
      <section>
        <span onClick={handleOpenFileDialog}>
          文件地址：
          <configContext.Consumer>
            {config => config?.multipleFilePath}
          </configContext.Consumer>
        </span>
      </section>
    ),
  };

  const open = () => {
    modalRef.current = modal.info(modalInfoConfig);
  };

  return [
    open,
    // eslint-disable-next-line react/jsx-key
    <configContext.Provider value={config}>
      {contextHolder}
    </configContext.Provider>,
  ];
};
