import { Modal } from 'antd';

export const useSettingModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const open = () => {
    modal.info({
      title: '配置',
      content: (
        <section>
          <span>文件地址：</span>
        </section>
      ),
    });
  };

  return [open, contextHolder];
};
