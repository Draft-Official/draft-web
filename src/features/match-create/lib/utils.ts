// --- Date Utils for Match Create ---

const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
      dateISO: formatDateISO(d),
      label: `${month}.${date} (${day})`,
      dayNum: date,
      dayStr: day,
      isToday: i === 0,
    });
  }
  return dates;
};
