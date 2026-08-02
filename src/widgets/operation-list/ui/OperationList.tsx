import type { Category, Operation } from "../../../entities/finance";

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
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <section className="operation-list-card" aria-labelledby="operation-list-title">
      <div className="list-heading">
        <div>
          <p className="eyebrow">История</p>
          <h2 id="operation-list-title">Список операций</h2>
        </div>
        <span className="operation-count">{operations.length}</span>
      </div>

      {operations.length === 0 ? (
        <p className="empty-list">Операций пока нет. Добавьте первую запись выше.</p>
      ) : (
        <ul className="operation-items">
          {operations.map((operation) => {
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
