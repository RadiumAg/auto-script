export enum EState {
  未完成,
  完成,
  出错,
}

export type TTableData = {
  shop: string;
  orderNumber: string;
  isLoading: boolean;
  state: EState;
};

export interface IShop {
  name: string;
  code: string;
  regex: RegExp;
}

export const shopRegex = /马来西亚|菲律宾|泰国|越南/g;
