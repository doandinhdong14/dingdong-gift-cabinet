import type { CalendarDayData } from './types';
import type { VintageCalendarConfig } from './config';

const VIETNAMESE_WEEKDAYS = [
  'CHỦ NHẬT',
  'THỨ HAI',
  'THỨ BA',
  'THỨ TƯ',
  'THỨ NĂM',
  'THỨ SÁU',
  'THỨ BẢY',
];

const VIETNAMESE_MONTHS = [
  'THÁNG MỘT',
  'THÁNG HAI',
  'THÁNG BA',
  'THÁNG TƯ',
  'THÁNG NĂM',
  'THÁNG SÁU',
  'THÁNG BẢY',
  'THÁNG TÁM',
  'THÁNG CHÍN',
  'THÁNG MƯỜI',
  'THÁNG MƯỜI MỘT',
  'THÁNG MƯỜI HAI',
];

// Reference data matching the video for Nov 15-19, 2026
const CANONICAL_2026_DAYS: Record<number, Partial<CalendarDayData>> = {
  15: {
    lunarMonth: 'Tháng Mười',
    lunarDay: 7,
    lunarYear: 'Bính Ngọ',
    canChi: 'Ngày Quý Tỵ',
    noteText: 'Còn 4 ngày nữa',
    numberColor: '#be1c2d', // Red
    dayOfWeekColor: '#be1c2d',
  },
  16: {
    lunarMonth: 'Tháng Mười',
    lunarDay: 8,
    lunarYear: 'Bính Ngọ',
    canChi: 'Ngày Giáp Ngọ',
    noteText: 'Còn 3 ngày nữa',
    numberColor: '#22385a', // Navy blue
    dayOfWeekColor: '#22385a',
  },
  17: {
    lunarMonth: 'Tháng Mười',
    lunarDay: 9,
    lunarYear: 'Bính Ngọ',
    canChi: 'Ngày Ất Mùi',
    noteText: 'Còn 2 ngày nữa',
    numberColor: '#22385a',
    dayOfWeekColor: '#22385a',
  },
  18: {
    lunarMonth: 'Tháng Mười',
    lunarDay: 10,
    lunarYear: 'Bính Ngọ',
    canChi: 'Ngày Bính Thân',
    noteText: 'Ngày mai tới...',
    numberColor: '#22385a',
    dayOfWeekColor: '#22385a',
  },
  19: {
    lunarMonth: 'Tháng Mười',
    lunarDay: 11,
    lunarYear: 'Bính Ngọ',
    canChi: 'Ngày Đinh Dậu',
    noteText: 'Ngày Quốc tế Nam giới',
    numberColor: '#be1c2d', // Red
    dayOfWeekColor: '#be1c2d',
  },
};

export function buildCalendarDays(config: VintageCalendarConfig): CalendarDayData[] {
  const start = new Date(config.startDate);
  const target = new Date(config.targetDate);

  if (isNaN(start.getTime()) || isNaN(target.getTime()) || start > target) {
    // Fallback to canonical 15-19 Nov 2026
    return buildDefaultDays(config);
  }

  const daysDiff = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  // Limit to reasonable number of pages (max 10) to avoid infinite flips
  const count = Math.min(Math.max(1, daysDiff + 1), 10);

  const result: CalendarDayData[] = [];
  const current = new Date(start);

  for (let i = 0; i < count; i++) {
    const dayNumber = current.getDate();
    const monthIndex = current.getMonth();
    const year = current.getFullYear();
    const dayOfWeek = VIETNAMESE_WEEKDAYS[current.getDay()];
    const isTarget = i === count - 1;

    // Check if we have canonical reference metadata
    const canonical = CANONICAL_2026_DAYS[dayNumber];

    const daysLeft = count - 1 - i;
    let noteText = '';
    if (isTarget) {
      noteText = config.targetLabel || 'Ngày kỷ niệm';
    } else if (canonical?.noteText) {
      noteText = canonical.noteText;
    } else if (daysLeft === 1) {
      noteText = 'Ngày mai tới...';
    } else {
      noteText = `Còn ${daysLeft} ngày nữa`;
    }

    const isSunday = current.getDay() === 0;
    const numberColor = isTarget || isSunday ? config.accentColor || '#be1c2d' : '#22385a';
    const dayOfWeekColor = numberColor;

    result.push({
      dayNumber,
      monthName: VIETNAMESE_MONTHS[monthIndex],
      year,
      dayOfWeek,
      numberColor,
      dayOfWeekColor,
      lunarMonth: canonical?.lunarMonth ?? 'Tháng Mười',
      lunarDay: canonical?.lunarDay ?? (7 + i),
      lunarYear: canonical?.lunarYear ?? 'Bính Ngọ',
      canChi: canonical?.canChi ?? '',
      noteText,
      isTarget,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

function buildDefaultDays(config: VintageCalendarConfig): CalendarDayData[] {
  const days = [15, 16, 17, 18, 19];
  return days.map((day) => {
    const canonical = CANONICAL_2026_DAYS[day]!;
    const isTarget = day === 19;
    return {
      dayNumber: day,
      monthName: 'THÁNG MƯỜI MỘT',
      year: config.year || 2026,
      dayOfWeek: day === 15 ? 'CHỦ NHẬT' : day === 16 ? 'THỨ HAI' : day === 17 ? 'THỨ BA' : day === 18 ? 'THỨ TƯ' : 'THỨ NĂM',
      numberColor: canonical.numberColor || (isTarget ? config.accentColor : '#22385a'),
      dayOfWeekColor: canonical.dayOfWeekColor || (isTarget ? config.accentColor : '#22385a'),
      lunarMonth: canonical.lunarMonth!,
      lunarDay: canonical.lunarDay!,
      lunarYear: canonical.lunarYear!,
      canChi: canonical.canChi!,
      noteText: isTarget ? (config.targetLabel || canonical.noteText!) : canonical.noteText!,
      isTarget,
    };
  });
}
