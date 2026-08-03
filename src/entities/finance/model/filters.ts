import type { CategoryId, Money, Operation, OperationType } from "./types";

export interface OperationFilters {
  readonly month: string;
  readonly type: OperationType | "all";
  readonly category: CategoryId | "all";
  readonly minAmount: Money | null;
  readonly maxAmount: Money | null;
}

export const emptyOperationFilters: OperationFilters = { month: "", type: "all", category: "all", minAmount: null, maxAmount: null };

export function filterOperations(operations: readonly Operation[], filters: OperationFilters): Operation[] {
  return operations.filter((operation) =>
    (!filters.month || operation.date.startsWith(filters.month)) &&
    (filters.type === "all" || operation.type === filters.type) &&
    (filters.category === "all" || operation.category === filters.category) &&
    (filters.minAmount === null || operation.amount >= filters.minAmount) &&
    (filters.maxAmount === null || operation.amount <= filters.maxAmount),
  );
}
