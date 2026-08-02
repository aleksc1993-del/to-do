import type { Category, CategoryId, IsoDate, Money, Operation, OperationId } from "./types";

const categoryId = (value: string) => value as CategoryId;
const date = (value: string) => value as IsoDate;
const money = (value: number) => value as Money;
const operationId = (value: string) => value as OperationId;

export const mockCategories: readonly Category[] = [
  {
    id: categoryId("salary"),
    name: "Зарплата",
    kind: "income",
    color: "#16a34a",
    isArchived: false,
  },
  {
    id: categoryId("groceries"),
    name: "Продукты",
    kind: "expense",
    color: "#f97316",
    isArchived: false,
  },
  {
    id: categoryId("transport"),
    name: "Транспорт",
    kind: "expense",
    color: "#2563eb",
    isArchived: false,
  },
] as const;

export const mockOperations: readonly Operation[] = [
  {
    id: operationId("operation-1"),
    type: "income",
    amount: money(15000000),
    category: categoryId("salary"),
    date: date("2026-08-01"),
    comment: "Зарплата за август",
  },
  {
    id: operationId("operation-2"),
    type: "expense",
    amount: money(425000),
    category: categoryId("groceries"),
    date: date("2026-08-02"),
    comment: "Покупки на неделю",
  },
  {
    id: operationId("operation-3"),
    type: "expense",
    amount: money(18000),
    category: categoryId("transport"),
    date: date("2026-08-02"),
    comment: "Поездка на работу",
  },
] as const;
