function assert<T extends boolean>(
  value: T,
  msg: string = 'Assertion failed',
): T extends false ? never : void {
  if (value === false) {
    throw new Error(msg);
  }

  value; // Hover shows `T extends boolean` but `true` would be more accurate.

  // Compiler rejects omitting this unnecessary return and cast. If `value` was inferred as `true`
  // then return type is `void`, therefore not returning is correct.
  return undefined as T extends false ? never : void;
}

function fail(): never {
  throw new Error('assertion failed');
}

function exampleUsage(x: 'a' | 'b') {
  if (x !== 'a') {
    assert(false); // Hover correctly shows return type is `never`

    // Uncommenting this causes `x` to be inferred as `'a'` below. It appears that the concrete
    // `never` from `fail()` is different from the `never` correctly inferred from `assert(false)`
    // above. (`assert<false>(false);` also doesn't work.)
    // fail();
  }

  x; // Hover shows `'a' | 'b'`, `'a'` would be more accurate.
}
