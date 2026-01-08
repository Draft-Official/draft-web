import { Match } from '../model/mock-data';

// --- Date Utils ---

export const getNext14Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    return days;
};

export const formatDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getDayLabel = (dateISO: string): string => {
    const date = new Date(dateISO);
    // Note: new Date('YYYY-MM-DD') depends on timezone. 
    // To be safe, we can parse manually or rely on browser interpretation if consistent.
    // For this mock app, standard Date parsing is acceptable.
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

// --- Filtering Logic ---

export interface FilterOptions {
    dateISO: string | null;
    positions: string[];
    locations: string[]; // e.g. ["서울 강남구", "서울 서초구"]
    priceMax?: number | null; // e.g. 10000
    hideClosed?: boolean; // hide closed matches
}

export const filterMatches = (
    matches: Match[],
    options: FilterOptions
): Match[] => {
    let filtered = [...matches];

    // 1. Date Filter
    // Ensure strict comparison of YYYY-MM-DD strings
    if (options.dateISO) {
        filtered = filtered.filter(m => m.dateISO === options.dateISO);
    }

    // 2. Location Filter
    // Compare selected location (e.g. "서울 강남구") with match.address (e.g. "서울 강남구 대치동...")
    if (options.locations.length > 0) {
        filtered = filtered.filter(m => {
            const matchAddress = m.address || ''; // Fallback if missing
            return options.locations.some(selectedLoc => {
                // Handle "서울 전체" case
                if (selectedLoc.includes('전체')) {
                    const region = selectedLoc.split(' ')[0]; // "서울"
                    return matchAddress.startsWith(region);
                }
                // Standard case: "서울 강남구" matches "서울 강남구 대치동..."
                // Using startsWith for accurate prefix matching
                return matchAddress.startsWith(selectedLoc);
            });
        });
    }

    // 3. Position Filter
    if (options.positions.length > 0) {
        filtered = filtered.filter(m => {
            if (options.positions.includes('포지션 무관')) return true;

            const posMap: Record<string, keyof Match['positions']> = {
                '가드': 'g',
                '포워드': 'f',
                '센터': 'c',
            };

            return options.positions.some(posLabel => {
                const posKey = posMap[posLabel];
                if (!posKey) return false;
                
                // Direct match
                const posData = m.positions[posKey];
                if (posData && posData.status === 'open') return true;

                // "All" position (wildcard)
                if (m.positions.all && m.positions.all.status === 'open') return true;

                // Bigman Logic: If searching for Forward or Center, also check Bigman
                if ((posKey === 'f' || posKey === 'c') && m.positions.bigman && m.positions.bigman.status === 'open') {
                    return true;
                }

                return false;
            });
        });
    }

    // 4. Price Filter
    if (options.priceMax !== null && options.priceMax !== undefined) {
        filtered = filtered.filter(m => m.priceNum <= options.priceMax!);
    }

    // 5. Hide Closed Filter
    if (options.hideClosed) {
        filtered = filtered.filter(m => !m.isClosed);
    }

    return filtered;
};

export const groupMatchesByDate = (matches: Match[]): Record<string, Match[]> => {
    const grouped: Record<string, Match[]> = {};
    matches.forEach(match => {
        if (!grouped[match.dateISO]) grouped[match.dateISO] = [];
        grouped[match.dateISO].push(match);
    });
    return grouped;
};
