import type { CurrencyCode, FinancialStatistics, Money, Operation, Period } from "./types";

const toMoney = (value: number): Money => value as Money;

export function calculateMonthlyStatistics(
  operations: readonly Operation[],
  month: string,
  currency: CurrencyCode = "RUB",
): FinancialStatistics {
  const monthOperations = operations.filter((operation) => operation.date.startsWith(month));
  const income = monthOperations.filter((operation) => operation.type === "income").reduce((sum, operation) => sum + operation.amount, 0);
  const expense = monthOperations.filter((operation) => operation.type === "expense").reduce((sum, operation) => sum + operation.amount, 0);
  const period: Period = { type: "month", year: Number(month.slice(0, 4)), month: Number(month.slice(5, 7)) };

  return {
    period,
    currency,
    totals: { income: toMoney(income), expense: toMoney(expense), balance: toMoney(income - expense) },
    byCategory: [],
    operationCount: monthOperations.length,
  };
}
