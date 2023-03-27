export type Await<T> = T extends Promise<infer U> ? U : T;

export enum EScriptType {
  tiktok = 'tiktok',
  shopped = 'shopped',
  tiktokCross = 'tiktokCross',
  Lazada = 'Lazada',
  TiktokIndonesia = 'TiktokIndonesia',
}
