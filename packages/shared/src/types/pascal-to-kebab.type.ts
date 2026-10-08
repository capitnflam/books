export type PascalToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${PascalToKebab<U>}`
    : `${Uncapitalize<T>}-${PascalToKebab<U>}`
  : '';
