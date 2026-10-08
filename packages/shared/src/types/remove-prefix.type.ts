export type RemovePrefix<S extends string, P extends string> = S extends `${P}${infer U}` ? U : S;
