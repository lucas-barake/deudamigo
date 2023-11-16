export type DatesToStrings<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string | null
    : T[P] extends Array<infer U>
    ? Array<DatesToStrings<U>>
    : T[P] extends object
    ? DatesToStrings<T[P]>
    : T[P];
};
