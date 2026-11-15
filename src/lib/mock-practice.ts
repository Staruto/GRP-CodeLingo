/** Pure, deterministic example data. These counts are not student records. */
export function createMockPracticeMonth(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const future = day > today.getDate();

    return {
      day,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      solved: future ? null : ((day * 11 + month * 3 + year) % 9) % 7,
    };
  });
}
