/** 순서와 무관한 중복 없는 선택값 배열을 비교합니다. */
export function haveSameSelection<T extends string>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}
