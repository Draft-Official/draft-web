export interface OptimisticOperationToken {
  resourceKey: string;
  sequence: number;
}

const latestSequenceByResource = new Map<string, number>();

export function buildOptimisticResourceKey(scope: string, ...parts: unknown[]): string {
  const normalizedParts = parts.map((part) => {
    if (part === null) return 'null';
    if (typeof part === 'undefined') return 'undefined';
    return encodeURIComponent(String(part));
  });

  return [encodeURIComponent(scope), ...normalizedParts].join('|');
}

export function beginOptimisticOperation(resourceKey: string): OptimisticOperationToken {
  const nextSequence = (latestSequenceByResource.get(resourceKey) ?? 0) + 1;
  latestSequenceByResource.set(resourceKey, nextSequence);

  return {
    resourceKey,
    sequence: nextSequence,
  };
}

export function isLatestOptimisticOperation(
  token: OptimisticOperationToken | null | undefined
): boolean {
  if (!token) return false;
  return latestSequenceByResource.get(token.resourceKey) === token.sequence;
}

export function finishOptimisticOperation(token: OptimisticOperationToken | null | undefined) {
  if (!token) return;

  if (isLatestOptimisticOperation(token)) {
    latestSequenceByResource.delete(token.resourceKey);
  }
}
