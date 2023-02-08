import { Modal, Select } from 'antd';
import { useRef } from 'react';
import Style from './index.module.scss';

export const useSheetsModal = () => {
  const [modal, contextHolder] = Modal.useModal();
  const modalRef = useRef<ReturnType<typeof modal.info>>();

  const open = (sheets: string[]) => {
    const defaultValue = sheets[0];
    let selectValue = defaultValue;
    modalRef.current = modal.info({
      title: '选择Sheet',
      onOk() {
        window.electron.onSheetSelect(selectValue);
      },
      content: (
        <Select
          defaultValue={defaultValue}
          className={Style['sheet-select']}
          onSelect={value => {
            selectValue = value;
          }}
          options={sheets.map(sheet => ({ value: sheet, label: sheet }))}
        />
      ),
    });
  };

  return [open, contextHolder] as const;
};
