export function swapItems(list: Array<any>, a: number, b: number): Array<any> {
  const tmp = list[a];
  list[a] = list[b];
  list[b] = tmp;
  return list;
}
