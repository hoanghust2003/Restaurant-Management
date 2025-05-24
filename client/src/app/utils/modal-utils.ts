import { ModalProps } from 'antd';

export const getModalProps = (props: Partial<ModalProps> = {}): Partial<ModalProps> => {
  const { destroyOnClose, ...rest } = props;
  
  // Replace destroyOnClose with destroyOnHidden
  if (destroyOnClose) {
    return {
      destroyOnHidden: true,
      ...rest
    };
  }

  return props;
};
