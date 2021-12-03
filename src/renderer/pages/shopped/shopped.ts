export enum EState {
  未完成,
  完成,
  出错,
}

export type TTableData = {
  orderNumber: string;
  isLoading: boolean;
  state: EState;
};
