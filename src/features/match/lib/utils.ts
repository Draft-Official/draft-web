import { GuestListMatch } from '../model/types';

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

export const formatDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDayLabel = (dateISO: string): string => {
    const date = new Date(dateISO);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
};

export const getShortDayLabel = (dateISO: string): string => {
    const date = new Date(dateISO);
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${day} (${dayOfWeek})`;
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

export const filterMatches = (
    matches: GuestListMatch[],
    options: FilterOptions
): GuestListMatch[] => {
    let filtered = [...matches];

    // 1. Date Filter
    if (options.dateISO) {
        filtered = filtered.filter(m => m.dateISO === options.dateISO);
    }

    // 2. Location Filter
    if (options.locations.length > 0) {
        filtered = filtered.filter(m => {
            const matchAddress = m.location.address || '';
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

    // 4. Position Filter
    if (options.positions.length > 0) {
        filtered = filtered.filter(m => {
            if (options.positions.includes('포지션 무관')) return true;

            const posMap: Record<string, keyof GuestListMatch['positionsUI']> = {
                '가드': 'g',
                '포워드': 'f',
                '센터': 'c',
            };

            return options.positions.some(posLabel => {
                const posKey = posMap[posLabel];
                if (!posKey) return false;

                const posData = m.positionsUI[posKey];
                // Check specific position
                if (posData && posData.status === 'open') return true;

                // Check "All" (포지션 무관)
                if (m.positionsUI.all && m.positionsUI.all.status === 'open') return true;

                return false;
            });
        });
    }

    // 5. Price Filter
    if (options.priceMax !== null && options.priceMax !== undefined) {
        filtered = filtered.filter(m => m.price.amount <= options.priceMax!);
    }

    // 6. Hide Closed / Min Vacancy Filter
    if (options.minVacancy && options.minVacancy > 0) {
        filtered = filtered.filter(m => {
            if (m.isClosed) return false;

            // Calculate total vacancy
            let totalVacancy = 0;
            const p = m.positionsUI;

            // Helper to add vacancy (max - current = remaining spots)
            const add = (pos?: { status: string, max: number, current: number }) => {
                if (pos && pos.status === 'open') totalVacancy += (pos.max - pos.current);
            };

            // Sum up positions
            add(p.all);
            add(p.g);
            add(p.f);
            add(p.c);

            return totalVacancy >= options.minVacancy!;
        });
    } else if (options.hideClosed) {
        filtered = filtered.filter(m => !m.isClosed);
    }

    // 7. Detailed Filters (Gender, Age, GameFormat)
    if (options.genders && options.genders.length > 0) {
         filtered = filtered.filter(m => m.gender && options.genders!.includes(m.gender));
    }

    if (options.ages && options.ages.length > 0) {
        filtered = filtered.filter(m => {
            // ageMin/ageMax로 ageRange 계산
            if (!m.ageMin || !m.ageMax) return false;
            if (options.ages!.includes('any')) return true;
            const ageRange = `${m.ageMin}대 ~ ${m.ageMax}대`;
            return options.ages!.some(age => ageRange.includes(age));
        });
    }

    if (options.gameFormats && options.gameFormats.length > 0) {
        filtered = filtered.filter(m => m.matchFormat && options.gameFormats!.includes(m.matchFormat));
    }

    return filtered;
};

export const groupMatchesByDate = (matches: GuestListMatch[]): Record<string, GuestListMatch[]> => {
    const grouped: Record<string, GuestListMatch[]> = {};
    matches.forEach(match => {
        if (!grouped[match.dateISO]) grouped[match.dateISO] = [];
        grouped[match.dateISO].push(match);
    });
    return grouped;
};
