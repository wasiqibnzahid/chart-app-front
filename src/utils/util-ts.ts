export function isValidDate(date: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(date)) {
    return false;
  }
  return true;
}
