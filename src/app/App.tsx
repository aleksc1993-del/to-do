import { useMemo, useState, type FormEvent } from "react";
import { calculateMonthlyStatistics, mockCategories, mockOperations, type CategoryId, type Money, type Operation } from "../entities/finance";

const formatter = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const formatMoney = (value: number) => formatter.format(value / 100);

export function App() {
  const [operations, setOperations] = useState<Operation[]>([...mockOperations]);
  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const statistics = useMemo(() => calculateMonthlyStatistics(operations, selectedMonth), [operations, selectedMonth]);
  const categories = useMemo(() => new Map(mockCategories.map((category) => [category.id, category])), []);

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    setOperations((current) => [{ id: crypto.randomUUID() as Operation["id"], type: "expense", amount: Math.round(amount * 100) as Money, category: "groceries" as CategoryId, date: `${selectedMonth}-01` as Operation["date"], comment: "Новая покупка" }, ...current]);
    event.currentTarget.reset();
  }

  return <main className="workspace">
    <section className="dashboard">
      <header className="page-header"><div><p className="muted">Обзор финансов</p><h1>Мои расходы</h1></div><label className="period">Месяц <input aria-label="Выбранный месяц" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></label></header>
      <div className="summary-grid">
        <article className="summary-card"><p>Общий доход</p><strong>{formatMoney(Number(statistics.totals.income))}</strong></article>
        <article className="summary-card"><p>Расходы</p><strong>{formatMoney(Number(statistics.totals.expense))}</strong></article>
        <article className="summary-card"><p>Баланс</p><strong className={Number(statistics.totals.balance) >= 0 ? "positive-value" : "negative-value"}>{formatMoney(Number(statistics.totals.balance))}</strong></article>
        <article className="summary-card"><p>Количество операций</p><strong>{statistics.operationCount}</strong></article>
      </div>
      <article className="card transactions"><div className="card-title"><h2>Операции за месяц</h2><span>{selectedMonth}</span></div>{operations.filter((operation) => operation.date.startsWith(selectedMonth)).map((operation) => <div className="transaction" key={operation.id}><div><strong>{categories.get(operation.category)?.name ?? "Без категории"}</strong><small>{operation.date} · {operation.comment}</small></div><b className={operation.type}>{operation.type === "income" ? "+" : "−"}{formatMoney(Number(operation.amount))}</b></div>)}{statistics.operationCount === 0 && <p>За выбранный месяц операций нет.</p>}</article>
      <article className="card quick-add"><h2>Добавить расход</h2><form onSubmit={addExpense}><input name="amount" type="number" min="0.01" step="0.01" placeholder="Сумма в ₽" required /><button type="submit">Добавить</button></form></article>
    </section>
  </main>;
}
