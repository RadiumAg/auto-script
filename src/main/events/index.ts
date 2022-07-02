import shopped from './shopped';

const initList = [shopped];

export const initEvents = () => {
  initList.forEach(_ => _());
};
