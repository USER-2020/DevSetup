declare module 'zod' {
  interface Schema<T = unknown> { parse(value: unknown): T; min(value: number): this; max(value: number): this; uuid(): this; optional(): this; }
  interface Zod { object(shape: Record<string, Schema>): Schema; array(schema: Schema): Schema; enum<T extends readonly [string, ...string[]]>(values: T): Schema<T[number]>; literal<T extends string | number | boolean>(value: T): Schema<T>; boolean(): Schema<boolean>; string(): Schema<string>; }
  export const z: Zod;
}
