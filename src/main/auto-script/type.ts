export type Await<T> = T extends Promise<infer U> ? U : T;

export type ScriptType = 'tiktok' | 'shopped' |'tiktok-cross';
