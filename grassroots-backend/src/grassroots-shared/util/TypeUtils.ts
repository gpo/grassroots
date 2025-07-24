/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
type Assert<A extends true> = A;
type AssertNot<A extends false> = A;

type Func = (...args: any[]) => any;

// IsAssignableTo<A, B> means that an object of type A can be treated as an object of type B.
// Using [A] extends [B] prevents union distrubution and union simplification.
// See below for examples where this is required!
type IsAssignableTo<A, B> = [A] extends [B] ? true : false;

function TestAndJustifyIsAssignableTo(): void {
  // Justify `[A] extends [B]` over `A extends B`.
  type BrokenIsAssignableToForTest<A, B> = A extends B ? true : false;

  // These two examples look identical, but "union distribution" only happens when parameter
  // substitution occurs. Union distribution causes the second case to evaluate as:
  // distribute("a" | "b" extends "a") => "a" extends "a" | "b" extends "a" => true | false.
  type TestExtensionWithoutUnionDistribution = AssertNot<
    "a" | "b" extends "a" ? true : false
  >;
  // This should be false, not boolean!
  type TestExtensionWithUnionDistribution = Assert<
    IsAssignableTo<boolean, BrokenIsAssignableToForTest<"a" | "b", "a">>
  >;

  // These two examples look identical, but "union simplification" only happens when parameter
  // substitution occurs. Union simplification causes the second case to evaluate as:
  // simplify(never | 1 extends never) => simplify(never | 1) extends never => 1 extends never => false;
  type TestNeverExtensionWithoutUnionSimplification = Assert<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    never extends never | 1 ? true : false
  >;
  // This should be true, not false!
  type TestNeverExtendsWithUnionSimplification = AssertNot<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    BrokenIsAssignableToForTest<never | 1, never>
  >;

  // Test IsAssignableTo.
  type TestStringIsAssignableToString = Assert<IsAssignableTo<string, string>>;
  type TestStringIsntAssignableToNumber = AssertNot<
    IsAssignableTo<string, number>
  >;
  type TestNeverIsAssignableToNever = Assert<IsAssignableTo<never, never>>;
  type TestStringIsntAssignableToNever = AssertNot<
    IsAssignableTo<string, never>
  >;
  type TestArrayIsAssignableToObject = Assert<IsAssignableTo<number[], object>>;
}

type If<A extends boolean, TVAL, FVAL> = A extends true ? TVAL : FVAL;

function TestIf(): void {
  type TestTrueIsTrue = Assert<If<true, true, false>>;
  type TestFalseIsFalse = Assert<If<false, false, true>>;
}

type And<A extends boolean, B extends boolean> = If<A, B, false>;

type Not<A extends boolean> = If<A, false, true>;

type Equals<A, B> = And<IsAssignableTo<A, B>, IsAssignableTo<B, A>>;

function TestEquals(): void {
  type TestEqualsForVaryingOptionality = AssertNot<
    Equals<{ x?: number; common: string }, { x: number; common: string }>
  >;

  type TestStringEqualsString = Assert<Equals<string, string>>;
  type TestStringDoesntEqualNumber = AssertNot<Equals<string, number>>;
  type TestFunctionEqualsFunc = Assert<Equals<(x: number) => string, Func>>;

  interface Wrapper<T> {
    x: T;
  }

  type StringPropertyDoesntEqualNumberProperty = AssertNot<
    Equals<Wrapper<string>, Wrapper<number>>
  >;
  type StringPropertyEqualsStringProperty = Assert<
    Equals<Wrapper<string>, Wrapper<string>>
  >;
}

type GetArrayItemType<A> = A extends (infer Item)[] ? Item : never;

function TestGetArrayItemType(): void {
  type TestNumberArrayContainsNumber = Assert<
    Equals<GetArrayItemType<number[]>, number>
  >;
  type TestNumberContainsNothing = Assert<
    Equals<GetArrayItemType<number>, never>
  >;
}

type IsArray<A> = IsAssignableTo<A, readonly any[]>;

function TestIsArray(): void {
  type TestStringArrayIsArray = Assert<Equals<IsArray<string[]>, true>>;
  type TestStringIsNotArray = Assert<Equals<IsArray<string>, false>>;
  type TestObjectIsNotArray = Assert<Equals<IsArray<object>, false>>;
}

type ExcludedKeys = "__DTOBrand" | "__entityBrand" | "__caslSubjectType";
type PropsOf<A> = {
  [k in keyof A as If<
    // Exclude functions.
    Equals<A[k], Func>,
    never,
    // Exclude excluded keys
    If<IsAssignableTo<k, ExcludedKeys>, never, k>
  >]: ValueToValueProps<A[k]>;
};

type ValueToValueProps<A> =
  // If it's an array, recurse.
  // We need to check for arrays before objects, as arrays are objects.
  If<
    IsArray<A>,
    PropsOf<GetArrayItemType<A>>[],
    // If it's an object, recurse.
    If<
      IsAssignableTo<A, object>,
      PropsOf<A>,
      // Otherwise, it's a primitive, leave it alone.
      A
    >
  >;

function TestPropsOf(): void {
  class WrapperWithMethod<T> {
    optional?: T;
    required!: T;
    default: T;
    constructor() {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.default = "foo" as T;
    }
    f(): void {
      console.log("Foo");
    }
  }

  type OptionalVsRequiredPropsOf = Assert<
    Equals<
      PropsOf<WrapperWithMethod<string>>,
      {
        optional?: string;
        required: string;
        default: string;
      }
    >
  >;

  class Nested {
    x!: {
      y?: number;
      f(): () => 2;
    };
  }

  type TestNestedOptionalProp = Assert<
    Equals<
      PropsOf<Nested>,
      {
        x: {
          y?: number;
        };
      }
    >
  >;

  class WithArrays {
    numbers!: number[];
    objs!: { x: string }[];
  }

  type TestNestedArrays = Assert<
    Equals<PropsOf<WithArrays>, { numbers: number[]; objs: { x: string }[] }>
  >;

  type TestExcludedKeys = Assert<
    Equals<PropsOf<{ __DTOBrand: 2; a: 1 }>, { a: 1 }>
  >;
}

type CommonProps<A, B> = {
  [k in keyof A & keyof B as If<IsAssignableTo<A[k], B[k]>, k, never>]: A[k];
};

type TestCommonProps = Assert<
  Equals<
    { a: number },
    CommonProps<
      {
        a: number;
        firstOnly: string;
        notMatching: string;
        optionalInAOnly?: string;
      },
      {
        a: number;
        secondOnly: string;
        notMatching: number;
        optionalInAOnly: string;
      }
    >
  >
>;
