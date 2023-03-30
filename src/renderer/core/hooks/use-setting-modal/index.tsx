import { Modal, Tooltip } from 'antd';
import { createContext, useRef } from 'react';
import { ConfigData } from 'main/config';
import { useConfig } from '../use-config';
import Style from './index.module.scss';

const configContext = createContext<ConfigData>({});

export const useSettingModal = () => {
  const [config, setConfig] = useConfig();
  const [modal, contextHolder] = Modal.useModal();
  const modalRef = useRef<ReturnType<typeof modal.info>>();

  const handleOpenFileDialog = () => {
    window.electron.onOpenFileDialog();
    window.electron.ipcRenderer.on(
      'onOpenFileDialog',
      ([filePath]: string[] | undefined) => {
        if (!filePath) return;
        setConfig({ multipleFilePath: filePath });
        modalRef.current.update(modalInfoConfig);
      },
    );
  };

  const modalInfoConfig = {
    title: '配置',
    content: (
      <section>
        <span onClick={handleOpenFileDialog} className={Style.file}>
          <span className={Style.title}>文件地址：</span>
          <span className={Style.value}>
            <Tooltip title={config?.multipleFilePath}>
              <span>
                <configContext.Consumer>
                  {(config: ConfigData) => config?.multipleFilePath}
                </configContext.Consumer>
              </span>
            </Tooltip>
          </span>
        </span>

        <span onClick={handleOpenFileDialog} className={Style.file}>
          <span className={Style.title}>AppUserData：</span>
          <span className={Style.value}>
            <Tooltip title={config?.appDataPath}>
              <span>
                <configContext.Consumer>
                  {(config: ConfigData) => config?.appDataPath}
                </configContext.Consumer>
              </span>
            </Tooltip>
          </span>
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
  ] as const;
};
