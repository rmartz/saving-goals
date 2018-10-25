export function setMembership<T>(list: T[], item: T, include: boolean): void {
  if (include && !list.includes(item)) {
    list.push(item);
  } else if (!include) {
    const pos = list.indexOf(item);
    if (pos > -1) {
      list.splice(pos, 1);
    }
  }
}
