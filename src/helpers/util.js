export function convertToTimeCode(value) {
  value = Math.max(value, 0);

  let h = Math.floor(value / 3600);
  let m = Math.floor((value % 3600) / 60);
  let s = Math.floor((value % 3600) % 60);
  return (
    (h === 0 ? "" : h < 10 ? "0" + h.toString() + ":" : h.toString() + ":") +
    (m < 10 ? "0" + m.toString() : m.toString()) +
    ":" +
    (s < 10 ? "0" + s.toString() : s.toString())
  );
}
