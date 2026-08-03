import { useMemo, useState } from "react";
import { emptyOperationFilters, filterOperations, type Category, type CategoryId, type Money, type Operation, type OperationFilters, type OperationType } from "../../../entities/finance";

interface OperationListProps {
  readonly operations: readonly Operation[];
  readonly categories: readonly Category[];
  readonly onDelete: (operationId: Operation["id"]) => void;
}

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatAmount(amount: Operation["amount"], type: Operation["type"]): string {
  const sign = type === "income" ? "+" : "−";
  return `${sign}${currencyFormatter.format(amount / 100)}`;
}

export function OperationList({ operations, categories, onDelete }: OperationListProps) {
  const [filters, setFilters] = useState<OperationFilters>(emptyOperationFilters);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const filteredOperations = useMemo(() => filterOperations(operations, filters), [operations, filters]);
  const updateFilter = <Field extends keyof OperationFilters>(field: Field, value: OperationFilters[Field]) => setFilters((current) => ({ ...current, [field]: value }));
  const parseAmount = (value: string): Money | null => {
    const amount = Number(value.replace(",", "."));
    return value.trim() && Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) as Money : null;
  };

  return (
    <section className="operation-list-card" aria-labelledby="operation-list-title">
      <div className="list-heading">
        <div>
          <p className="eyebrow">История</p>
          <h2 id="operation-list-title">Список операций</h2>
        </div>
        <span className="operation-count">{filteredOperations.length}</span>
      </div>

      <div className="filters" aria-label="Фильтры операций">
        <label className="filter-field"><span>Месяц</span><input type="month" value={filters.month} onChange={(event) => updateFilter("month", event.target.value)} /></label>
        <label className="filter-field"><span>Тип</span><select value={filters.type} onChange={(event) => updateFilter("type", event.target.value as OperationType | "all")}><option value="all">Все типы</option><option value="income">Доход</option><option value="expense">Расход</option></select></label>
        <label className="filter-field"><span>Категория</span><select value={filters.category} onChange={(event) => updateFilter("category", event.target.value === "all" ? "all" : event.target.value as CategoryId)}><option value="all">Все категории</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
        <label className="filter-field"><span>Сумма от</span><input inputMode="decimal" placeholder="0,00" onChange={(event) => updateFilter("minAmount", parseAmount(event.target.value))} /></label>
        <label className="filter-field"><span>Сумма до</span><input inputMode="decimal" placeholder="0,00" onChange={(event) => updateFilter("maxAmount", parseAmount(event.target.value))} /></label>
        <button className="clear-filters" type="button" onClick={() => setFilters(emptyOperationFilters)}>Сбросить</button>
      </div>

      {filteredOperations.length === 0 ? (
        <p className="empty-list">Операций пока нет. Добавьте первую запись выше.</p>
      ) : (
        <ul className="operation-items">
          {filteredOperations.map((operation) => {
            const category = categoryById.get(operation.category);
            return (
              <li className="operation-item" key={operation.id}>
                <span className="operation-marker" style={{ backgroundColor: category?.color ?? "#94a3b8" }} aria-hidden="true" />
                <div className="operation-main">
                  <div className="operation-title-row">
                    <strong>{category?.name ?? "Без категории"}</strong>
                    <span className={`operation-amount ${operation.type}`}>{formatAmount(operation.amount, operation.type)}</span>
                  </div>
                  <div className="operation-meta">
                    <time dateTime={operation.date}>{dateFormatter.format(new Date(`${operation.date}T00:00:00`))}</time>
                    {operation.comment && <span>{operation.comment}</span>}
                  </div>
                </div>
                <button className="delete-operation" type="button" onClick={() => onDelete(operation.id)} aria-label={`Удалить операцию: ${category?.name ?? "без категории"}`}>
                  Удалить
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
