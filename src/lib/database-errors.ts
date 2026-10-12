/** Classify only known codes; never expose driver messages or query parameters. */
export function isDatabaseConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as {
    code?: unknown;
    cause?: { kind?: unknown; originalCode?: unknown };
  };
  return (
    value.code === "P2034" ||
    value.cause?.kind === "TransactionWriteConflict" ||
    value.cause?.originalCode === "40001" ||
    value.cause?.originalCode === "40P01"
  );
}

/** Only for transactions with no external side effects, after a known rollback. */
export async function retryDatabaseConflict<T>(
  transaction: () => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await transaction();
    } catch (error) {
      if (attempt >= 2 || !isDatabaseConflict(error)) throw error;
    }
  }
}
