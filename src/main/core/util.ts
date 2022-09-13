import { mainWindow } from '../main';

export const sleep = async (time: number) => {
  let sign;
  await new Promise(resolve => {
    sign = setTimeout(() => {
      clearTimeout(sign);
      resolve(time);
    }, time);
  });
};

export const setProgress = () => {
  let sign;
  let progress = 0;
  const INCREMENT = 0.03;

  return {
    finsh() {
      if (!sign) return;
      progress = 1;
      const timeOutSign = setTimeout(() => {
        clearTimeout(timeOutSign);
        progress = 0;
        mainWindow.setProgressBar(-1);
        clearInterval(sign);
      }, 100);
    },
    start() {
      if (sign) return;
      sign = setInterval(() => {
        mainWindow.setProgressBar((progress += INCREMENT));
      }, 100);
    },
  };
};
