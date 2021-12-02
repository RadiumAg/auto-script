import shopped from './shopped';

const initList = [shopped];

// eslint-disable-next-line import/prefer-default-export
export const initEvents = () => {
  initList.forEach((_) => _());
};
