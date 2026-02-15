const AGE_VALUE_MAP: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50+': 50 };
const AGE_ORDER = ['20', '30', '40', '50+'];

export function convertSelectedAgesToRange(selectedAges: string[]): { min: number; max: number | null } | undefined {
  if (selectedAges.length === 0 || selectedAges.includes('any')) {
    return undefined;
  }

  const sortedAges = [...selectedAges].sort(
    (a, b) => (AGE_VALUE_MAP[a] || 0) - (AGE_VALUE_MAP[b] || 0)
  );

  const firstAge = sortedAges[0];
  const lastAge = sortedAges[sortedAges.length - 1];

  const min = AGE_VALUE_MAP[firstAge] || 20;
  const max = lastAge === '50+' ? null : (AGE_VALUE_MAP[lastAge] || null);

  return { min, max };
}

export function nextSelectedAges(current: string[], age: string): string[] {
  if (age === 'any') {
    return ['any'];
  }

  if (current.includes('any')) {
    return [age];
  }

  const isRemoving = current.includes(age);

  if (isRemoving) {
    const sortedCurrent = [...current].sort((a, b) => (AGE_VALUE_MAP[a] || 0) - (AGE_VALUE_MAP[b] || 0));
    const removeIndex = sortedCurrent.indexOf(age);

    if (removeIndex === -1) return current;

    const leftSegment = sortedCurrent.slice(0, removeIndex);
    const rightSegment = sortedCurrent.slice(removeIndex + 1);

    return leftSegment.length >= rightSegment.length
      ? (leftSegment.length > 0 ? leftSegment : [])
      : rightSegment;
  }

  let newAges = [...current, age].filter((a) => a !== 'any');

  if (newAges.length >= 2) {
    const numericAges = newAges
      .map((a) => AGE_VALUE_MAP[a])
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b);

    const min = numericAges[0];
    const max = numericAges[numericAges.length - 1];

    const filledAges: string[] = [];
    AGE_ORDER.forEach((ageStr) => {
      const val = AGE_VALUE_MAP[ageStr];
      if (val >= min && val <= max) {
        filledAges.push(ageStr);
      }
    });

    newAges = filledAges;
  }

  return newAges;
}
