// --- Date Utils for Match Create ---

export interface DateOption {
  dateISO: string;
  label: string;
  dayNum: number | string;
  dayStr: string;
  isToday: boolean;
}

export const getNext14Days = (): DateOption[] => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];

    dates.push({
      dateISO: d.toISOString().split('T')[0],
      label: `${month}.${date} (${day})`,
      dayNum: date,
      dayStr: day,
      isToday: i === 0,
    });
  }
  return dates;
};
