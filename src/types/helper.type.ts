/**
 * Utility type to "prettify" a complex TypeScript type.
 *
 * By re-mapping all keys, this flattens intersections and makes
 * IDE tooltips more readable (instead of showing raw intersections).
 *
 * @template T - The type to prettify.
 *
 * @example
 * type A = { a: number } & { b: string };
 * type B = Prettify<A>;
 * // B = { a: number; b: string }
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

/**
 * Utility type to recursively "prettify" child properties of an object type.
 *
 * Applies {@link Prettify} to each property of `T`. Useful when dealing with
 * nested intersections or mapped types.
 *
 * @template T - The type whose child properties should be prettified.
 *
 * @example
 * type Nested = {
 *   foo: { a: number } & { b: string };
 *   bar: { c: boolean };
 * };
 * type Clean = PrettifyChild<Nested>;
 * // Clean = {
 * //   foo: { a: number; b: string };
 * //   bar: { c: boolean };
 * // }
 */
export type PrettifyChild<T> = {
    [K in keyof T]: Prettify<T[K]>;
} & {};

/**
 * Transforms an object type `T` into a discriminated union type.
 *
 * For each key in `T`, produces a type that merges the properties of `T[K]`
 * with a `type` property set to the key name `K`. The resulting union consists
 * of all such types for each key in `T`.
 *
 * @template T - The object type to transform into a discriminated union.
 *
 * @example
 * type Example = {
 *   foo: { a: number };
 *   bar: { b: string };
 * };
 *
 * type Result = DiscoUnion<Example>;
 * // Result =
 * //   | { type: "foo"; a: number }
 * //   | { type: "bar"; b: string }
 */
export type DiscoUnion<T> = {
    [K in keyof T]: Prettify<
        {
            type: K;
        } & T[K]
    >;
}[keyof T];
