/**
   * Clamp function, constraints a value to be in a range.
   * Outliers will be clamped to the relevant extreme of the range.
   * @param min Minimin possibile value.
   * @param max Maximinum possible value.
   * @param value Vlue you want to clamp
   */
export function clamp(min: number, max: number, value: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Lerp function, used to get a value in range based on a percentage.
 * Outliers will be clamped.
 * @param a Lower part of the a-b range. Minumum value passibile.
 * @param b Upper part of the a-b range. Maximum value possible.
 * @param t Number decimale, from 0 to 1, which rapresent where value lives between a-b range.
 * @param clamp If true, value will be clamped to a-b range. Default is true.
 */
export function lerp(a: number, b: number, t: number, clampResult: boolean = true) {
  const value = (b - a) * t + a;
  return clampResult ? clamp(a, b, value) : value;
}
/**
 * Lerp Inversed function, used to get the percentage of a value in a range.
 * Outliers will be clamped.
 * @param a Lower part of the a-b range. Minumum value passibile.
 * @param b Upper part of the a-b range. Maximum value possible.
 * @param value Number that must be in range a-b, rapresent the value that you want to know where it sits in a-b range.
 * @param clamp If true, value will be clamped to a-b range. Default is true.
 */
export function lerpInverse(a: number, b: number, value: number, clampResult: boolean = true): number {
  const t = (value - a) / (b - a);
  return clampResult ? clamp(0, 1, t) : t;
}


/**
 * Sum function. Accept array of numbers and return the sum.
 */
export const sum = (nums: number[]): number => {
  return nums.reduce((acc, num) => acc + num, 0);
};

/**
 * Mean function. Accept array of numbers and return the mean.
 */
export function mean(nums: number[]): number {
  return sum(nums) / nums.length;
}

export function wrap(min: number, max: number, value: number) {
  if (value < min) return max;
  if (value > max) return min;
  return value;
}