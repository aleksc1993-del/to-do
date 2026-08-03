import { describe, expect, it } from "vitest";
import { validateOperationForm, type FormValues } from "../model/validation";
import type { Category, CategoryId } from "../../../entities/finance";

const categories: Category[] = [
  { id: "food" as CategoryId, name: "Еда", kind: "expense", isArchived: false },
  { id: "salary" as CategoryId, name: "Зарплата", kind: "income", isArchived: false },
  { id: "old" as CategoryId, name: "Архив", kind: "expense", isArchived: true },
];

const validValues: FormValues = { type: "expense", amount: "12,50", date: "2026-08-03", category: "food", comment: "" };

describe("operation form validation", () => {
  it("accepts valid decimal amount and matching active category", () => {
    expect(validateOperationForm(validValues, categories)).toEqual({});
  });

  it("rejects invalid amount, date and category", () => {
    expect(validateOperationForm({ ...validValues, amount: "0", date: "", category: "salary" }, categories)).toEqual({
      amount: "Введите сумму больше нуля",
      date: "Укажите корректную дату",
      category: "Категория не подходит для этого типа операции",
    });
  });

  it("rejects more than two decimal places and archived categories", () => {
    expect(validateOperationForm({ ...validValues, amount: "1.234", category: "old" }, categories)).toEqual({
      amount: "Используйте не более двух знаков после запятой",
      category: "Категория не подходит для этого типа операции",
    });
  });
});
