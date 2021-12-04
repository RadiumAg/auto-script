export const sleep = async (time: number) => {
  let sign;
  await new Promise((resolve) => {
    sign = setTimeout(() => {
      clearTimeout(sign);
      resolve(time);
    }, time);
  });
};
