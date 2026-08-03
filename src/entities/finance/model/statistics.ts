import type { Category, CurrencyCode, FinancialStatistics, Money, Operation, Period, TrendPoint } from "./types";

const toMoney = (value: number): Money => value as Money;

export function calculateMonthlyStatistics(
  operations: readonly Operation[],
  month: string,
  currency: CurrencyCode = "RUB",
  categories: readonly Category[] = [],
): FinancialStatistics {
  const monthOperations = operations.filter((operation) => operation.date.startsWith(month));
  const income = monthOperations.filter((operation) => operation.type === "income").reduce((sum, operation) => sum + operation.amount, 0);
  const expense = monthOperations.filter((operation) => operation.type === "expense").reduce((sum, operation) => sum + operation.amount, 0);
  const period: Period = { type: "month", year: Number(month.slice(0, 4)), month: Number(month.slice(5, 7)) };

  const categoryTotals = new Map<string, { amount: number; operationCount: number }>();
  monthOperations.filter((operation) => operation.type === "expense").forEach((operation) => {
    const current = categoryTotals.get(operation.category) ?? { amount: 0, operationCount: 0 };
    categoryTotals.set(operation.category, { amount: current.amount + operation.amount, operationCount: current.operationCount + 1 });
  });
  const byCategory = [...categoryTotals.entries()]
    .map(([categoryId, value]) => ({ categoryId: categoryId as Operation["category"], amount: toMoney(value.amount), operationCount: value.operationCount, share: expense === 0 ? 0 : value.amount / expense }))
    .sort((left, right) => right.amount - left.amount);
  const knownCategoryIds = new Set(categories.map((category) => category.id));
  const filteredByCategory = categories.length === 0 ? byCategory : byCategory.filter((statistic) => knownCategoryIds.has(statistic.categoryId));

  return {
    period,
    currency,
    totals: { income: toMoney(income), expense: toMoney(expense), balance: toMoney(income - expense) },
    byCategory: filteredByCategory,
    operationCount: monthOperations.length,
  };
}

export function calculateTrend(operations: readonly Operation[], month: string, mode: "day" | "month"): readonly TrendPoint[] {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const labels = mode === "day"
    ? Array.from({ length: new Date(year, monthNumber, 0).getDate() }, (_, index) => String(index + 1).padStart(2, "0"))
    : Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  return labels.map((label) => {
    const matches = operations.filter((operation) => mode === "day"
      ? operation.date === `${month}-${label}`
      : operation.date.startsWith(`${year}-${label}`));
    return {
      label,
      income: toMoney(matches.filter((operation) => operation.type === "income").reduce((sum, operation) => sum + operation.amount, 0)),
      expense: toMoney(matches.filter((operation) => operation.type === "expense").reduce((sum, operation) => sum + operation.amount, 0)),
    };
  });
}
