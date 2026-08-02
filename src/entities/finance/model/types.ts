/** Идентификаторы доменных сущностей не смешиваются со строками. */
export type Brand<Value, BrandName extends string> = Value & {
  readonly __brand: BrandName;
};

export type IncomeId = Brand<string, "IncomeId">;
export type ExpenseId = Brand<string, "ExpenseId">;
export type CategoryId = Brand<string, "CategoryId">;
export type OperationId = Brand<string, "OperationId">;

/** Денежное значение в минимальных единицах валюты, например в копейках. */
export type Money = Brand<number, "Money">;
export type CurrencyCode = "RUB" | "USD" | "EUR";

export type IsoDate = Brand<string, "IsoDate">;

export type CategoryKind = "income" | "expense";

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly kind: CategoryKind;
  readonly color?: string;
  readonly icon?: string;
  readonly isArchived: boolean;
}

export interface Income {
  readonly id: IncomeId;
  readonly type: "income";
  readonly amount: Money;
  readonly currency: CurrencyCode;
  readonly categoryId: CategoryId;
  readonly occurredAt: IsoDate;
  readonly description?: string;
  readonly createdAt: IsoDate;
}

export interface Expense {
  readonly id: ExpenseId;
  readonly type: "expense";
  readonly amount: Money;
  readonly currency: CurrencyCode;
  readonly categoryId: CategoryId;
  readonly occurredAt: IsoDate;
  readonly description?: string;
  readonly createdAt: IsoDate;
}

export type FinancialOperation = Income | Expense;

export type Period =
  | { readonly type: "day"; readonly date: IsoDate }
  | { readonly type: "week"; readonly year: number; readonly week: number }
  | { readonly type: "month"; readonly year: number; readonly month: number }
  | { readonly type: "quarter"; readonly year: number; readonly quarter: 1 | 2 | 3 | 4 }
  | { readonly type: "year"; readonly year: number }
  | { readonly type: "custom"; readonly from: IsoDate; readonly to: IsoDate };

export interface OperationTotals {
  readonly income: Money;
  readonly expense: Money;
  readonly balance: Money;
}

export interface CategoryStatistic {
  readonly categoryId: CategoryId;
  readonly amount: Money;
  readonly operationCount: number;
  readonly share: number;
}

export interface FinancialStatistics {
  readonly period: Period;
  readonly currency: CurrencyCode;
  readonly totals: OperationTotals;
  readonly byCategory: readonly CategoryStatistic[];
  readonly operationCount: number;
}
