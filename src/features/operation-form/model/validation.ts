import type { Category } from "../../../entities/finance";

export interface FormValues {
  readonly type: "income" | "expense";
  readonly amount: string;
  readonly date: string;
  readonly category: string;
  readonly comment: string;
}

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export function validateOperationForm(values: FormValues, categories: readonly Category[]): FormErrors {
  const errors: FormErrors = {};
  const amount = Number(values.amount.replace(",", "."));
  const category = categories.find(({ id }) => id === values.category);

  if (!values.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Введите сумму больше нуля";
  } else if (!/^\d+(?:[.,]\d{1,2})?$/.test(values.amount.trim())) {
    errors.amount = "Используйте не более двух знаков после запятой";
  }
  if (!values.date || Number.isNaN(Date.parse(values.date))) errors.date = "Укажите корректную дату";
  if (!values.category) errors.category = "Выберите категорию";
  else if (!category || category.kind !== values.type || category.isArchived) errors.category = "Категория не подходит для этого типа операции";
  return errors;
}
