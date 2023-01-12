import { useMount } from 'ahooks';
import { message } from 'antd';
import { ConfigData } from 'main/config';
import { useState } from 'react';

export const useConfig = () => {
  const [config, setConfig] = useState<ConfigData>({});

  const loadConfig = () => {
    window.electron.getConfig();
    window.electron.ipcRenderer.once('getConfig', memConfig => {
      setConfig(memConfig);
    });
  };

  const setMemoConfig = (newConfig: ConfigData) => {
    console.log(newConfig);
    window.electron.setConfing(newConfig);
    window.electron.ipcRenderer.once('setConfig', result => {
      console.log(result);
      if (result instanceof Error) {
        message.error(result.message);
      } else {
        loadConfig();
      }
    });
  };

  useMount(() => {
    loadConfig();
  });

  return [config, setMemoConfig] as const;
};
