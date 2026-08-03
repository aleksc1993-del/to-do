import { describe, expect, it } from "vitest";
import { calculateMonthlyStatistics, calculateTrend } from "./statistics";
import { filterOperations, emptyOperationFilters } from "./filters";
import type { CategoryId, IsoDate, Money, Operation, OperationId } from "./types";

const operation = (id: string, type: Operation["type"], amount: number, category: string, date: string): Operation => ({
  id: id as OperationId, type, amount: amount as Money, category: category as CategoryId, date: date as IsoDate, comment: "",
});

const operations = [
  operation("1", "income", 100000, "salary", "2026-08-01"),
  operation("2", "expense", 25000, "food", "2026-08-02"),
  operation("3", "expense", 15000, "transport", "2026-08-02"),
  operation("4", "expense", 9000, "food", "2026-07-31"),
];

describe("finance calculations", () => {
  it("calculates monthly totals and category shares", () => {
    const result = calculateMonthlyStatistics(operations, "2026-08");
    expect(result.totals).toEqual({ income: 100000, expense: 40000, balance: 60000 });
    expect(result.byCategory).toEqual([
      { categoryId: "food", amount: 25000, operationCount: 1, share: 0.625 },
      { categoryId: "transport", amount: 15000, operationCount: 1, share: 0.375 },
    ]);
  });

  it("returns a complete daily trend with zero-filled days", () => {
    const result = calculateTrend(operations, "2026-08", "day");
    expect(result).toHaveLength(31);
    expect(result[1]).toEqual({ label: "02", income: 0, expense: 40000 });
    expect(result[2]).toEqual({ label: "03", income: 0, expense: 0 });
  });
});

describe("operation filtering", () => {
  it("applies month, type, category and amount bounds together", () => {
    const result = filterOperations(operations, { ...emptyOperationFilters, month: "2026-08", type: "expense", category: "food" as CategoryId, minAmount: 20000 as Money, maxAmount: 30000 as Money });
    expect(result.map(({ id }) => id)).toEqual(["2"]);
  });
});
