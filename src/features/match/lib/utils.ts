import type { GuestMatchListItemDTO } from '../model/types';
import { formatKSTDateISO, getKSTDateParts, parseKSTDateISO } from '@/shared/lib/datetime';

// --- Date Utils ---

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
    const today = parseKSTDateISO(formatKSTDateISO(new Date()));

    for (let i = 0; i < 14; i++) {
        const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const parts = getKSTDateParts(d);
        if (!parts) continue;
        const month = parts.month;
        const date = parts.day;
        const day = days[parts.weekday];

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

export const formatDateISO = (date: Date): string => {
    return formatKSTDateISO(date);
};

export const getDayLabel = (dateISO: string): string => {
    const parts = getKSTDateParts(parseKSTDateISO(dateISO));
    if (!parts) return '';
    return `${parts.month}월 ${parts.day}일 (${parts.weekdayLabel})`;
};

export const getShortDayLabel = (dateISO: string): string => {
    const parts = getKSTDateParts(parseKSTDateISO(dateISO));
    if (!parts) return '';
    return `${parts.day} (${parts.weekdayLabel})`;
};

/**
 * 매치가 1시간 이내에 생성되었는지 확인
 * @param createdAt ISO timestamp
 * @returns NEW 뱃지 표시 여부
 */
export const isNewMatch = (createdAt: string | undefined): boolean => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 1;
};

// --- Filtering Logic ---

export interface FilterOptions {
    dateISO: string | null;
    positions: string[];
    locations: string[]; // e.g. ["서울 강남구", "서울 서초구"]
    startTimeRange?: [number, number] | null; // e.g. [6, 18] (6:00 ~ 18:00)
    priceMax?: number | null; // e.g. 10000
    hideClosed?: boolean; // hide closed matches
    minVacancy?: number | null; // e.g. 3 (at least 3 spots)
    // Detailed Filters
    genders?: string[]; // 'men', 'women', 'mixed'
    ages?: string[]; // '20', '30' ...
    gameFormats?: string[]; // '3vs3', '5vs5'
}

function parsePriceAmount(priceDisplay: string): number {
    if (priceDisplay === '무료') return 0;
    if (priceDisplay.startsWith('음료수')) return 0;
    return Number(priceDisplay.replace(/[^\d]/g, '')) || 0;
}

function parseAgeDisplay(ageDisplay: string | null): { min: number; max: number | null } | null {
    if (!ageDisplay) return null;

    const higher = ageDisplay.match(/^(\d+)대\s+이상$/);
    if (higher) {
        return { min: Number(higher[1]), max: null };
    }

    const range = ageDisplay.match(/^(\d+)대\s*~\s*(\d+)대$/);
    if (range) {
        return { min: Number(range[1]), max: Number(range[2]) };
    }

    return null;
}

export const filterMatches = (
    matches: GuestMatchListItemDTO[],
    options: FilterOptions
): GuestMatchListItemDTO[] => {
    let filtered = [...matches];

    // 1. Date Filter
    if (options.dateISO) {
        filtered = filtered.filter(m => m.dateISO === options.dateISO);
    }

    // 2. Location Filter
    if (options.locations.length > 0) {
        filtered = filtered.filter(m => {
            const matchAddress = m.gymAddress || '';
            return options.locations.some(selectedLoc => {
                if (selectedLoc.includes('전체')) {
                    const region = selectedLoc.split(' ')[0];
                    return matchAddress.startsWith(region);
                }
                return matchAddress.startsWith(selectedLoc);
            });
        });
    }

    // 3. Start Time Filter
    if (options.startTimeRange) {
        const [minHour, maxHour] = options.startTimeRange;
        filtered = filtered.filter(m => {
            if (!m.startTime) return false;
            // startTime is in "HH:MM" format
            const hour = parseInt(m.startTime.split(':')[0], 10);
            return hour >= minHour && hour < maxHour;
        });
    }

    // 4. Position Filter (DTO의 positions 객체 직접 사용)
    if (options.positions.length > 0) {
        filtered = filtered.filter(m => {
            const p = m.positions;
            const hasAllVacancy = !!p.all && p.all.status === 'open' && p.all.current < p.all.max;
            if (options.positions.includes('포지션 무관')) return hasAllVacancy;

            const posMap: Record<string, keyof typeof p> = {
                '가드': 'g',
                '포워드': 'f',
                '센터': 'c',
            };

            return options.positions.some(posLabel => {
                const posKey = posMap[posLabel];
                if (!posKey) return false;

                const posData = p[posKey];
                if (posData && posData.status === 'open' && posData.current < posData.max) return true;
                if (hasAllVacancy) return true;

                return false;
            });
        });
    }

    // 5. Price Filter
    if (options.priceMax !== null && options.priceMax !== undefined) {
        filtered = filtered.filter(m => parsePriceAmount(m.priceDisplay) <= options.priceMax!);
    }

    // 6. Hide Closed Filter (독립적으로 적용)
    if (options.hideClosed) {
        filtered = filtered.filter(m => !m.isClosed);
    }

    // 7. Min Vacancy Filter (hideClosed와 독립적으로 적용)
    if (options.minVacancy && options.minVacancy > 1) {
        filtered = filtered.filter(m => {
            let totalVacancy = 0;
            const p = m.positions;

            const add = (pos?: { status: string; max: number; current: number }) => {
                if (pos && pos.status === 'open') totalVacancy += (pos.max - pos.current);
            };

            add(p.all);
            add(p.g);
            add(p.f);
            add(p.c);

            return totalVacancy >= options.minVacancy!;
        });
    }

    // 7. Detailed Filters (Gender, Age, GameFormat)
    if (options.genders && options.genders.length > 0) {
         filtered = filtered.filter(m => m.genderRule && options.genders!.includes(m.genderRule));
    }

    if (options.ages && options.ages.length > 0) {
        filtered = filtered.filter(m => {
            if (options.ages!.includes('any')) return true;

            const ageRange = parseAgeDisplay(m.ageDisplay);
            if (!ageRange) return false;

            return options.ages!.some((age) => {
                const ageDecade = age === '50+' ? 50 : Number(age);
                if (Number.isNaN(ageDecade)) return false;
                if (ageRange.max === null) return ageDecade >= ageRange.min;
                return ageDecade >= ageRange.min && ageDecade <= ageRange.max;
            });
        });
    }

    if (options.gameFormats && options.gameFormats.length > 0) {
        filtered = filtered.filter(m => m.matchFormat && options.gameFormats!.includes(m.matchFormat));
    }

    return filtered;
};

export const groupMatchesByDate = (matches: GuestMatchListItemDTO[]): Record<string, GuestMatchListItemDTO[]> => {
    const grouped: Record<string, GuestMatchListItemDTO[]> = {};
    matches.forEach(match => {
        if (!grouped[match.dateISO]) grouped[match.dateISO] = [];
        grouped[match.dateISO].push(match);
    });
    return grouped;
};
