import { useEffect, useMemo, useState, type FormEvent } from "react";
import { calculateMonthlyStatistics, mockCategories, mockOperations, type CategoryId, type Money, type Operation } from "../entities/finance";
import { createLocalStorageAdapter } from "../shared";
import "./statistics.css";

const storage = createLocalStorageAdapter<Operation[]>({ key: "expense-calculator.operations", isValue: (value): value is Operation[] => Array.isArray(value) });
const moneyFormatter = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const formatMoney = (amount: number) => moneyFormatter.format(amount / 100);

export function App() {
  const [operations, setOperations] = useState<Operation[]>(() => storage.load() ?? [...mockOperations]);
  const [month, setMonth] = useState("2026-08");
  useEffect(() => { storage.save(operations); }, [operations]);

  const stats = useMemo(() => calculateMonthlyStatistics(operations, month, "RUB", mockCategories), [operations, month]);
  const categories = useMemo(() => new Map(mockCategories.map((category) => [category.id, category])), []);
  const monthOperations = operations.filter((operation) => operation.date.startsWith(month));
  const dailyExpenses = Array.from({ length: 7 }, (_, index) => monthOperations.filter((operation) => operation.type === "expense" && Number(operation.date.slice(-2)) === index + 1).reduce((sum, operation) => sum + operation.amount, 0));
  const maxDailyExpense = Math.max(...dailyExpenses, 1);
  const selectedMonth = monthFormatter.format(new Date(`${month}-01T00:00:00`));

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const amount = Number(new FormData(form).get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    setOperations((current) => [{ id: crypto.randomUUID() as Operation["id"], type: "expense", amount: Math.round(amount * 100) as Money, category: "groceries" as CategoryId, date: `${month}-01` as Operation["date"], comment: "Новая покупка" }, ...current]);
    form.reset();
  }

  return <main className="workspace">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">₽</span><strong>Финансы</strong></div>
      <nav className="nav" aria-label="Основная навигация">
        <button className="nav-item" type="button"><span>⌂</span>Обзор</button>
        <button className="nav-item active" type="button" aria-current="page"><span>◒</span>Статистика</button>
        <button className="nav-item" type="button"><span>↕</span>Операции</button>
      </nav>
      <button className="add-button" type="button" onClick={() => document.querySelector<HTMLInputElement>('input[name="amount"]')?.focus()}>＋ Добавить операцию</button>
      <div className="profile"><span className="avatar">АИ</span><div><strong>Алексей Иванов</strong><small>Личный аккаунт</small></div><span>•••</span></div>
    </aside>
    <section className="dashboard">
      <header className="page-header"><div><p className="muted">Аналитика финансов</p><h1>Статистика</h1></div><label className="period">Период <input aria-label="Выбранный месяц" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></header>
      <div className="summary-grid">
        <article className="summary-card"><p>Доходы</p><strong>{formatMoney(Number(stats.totals.income))}</strong><span className="positive-value">↑ за месяц</span></article>
        <article className="summary-card"><p>Расходы</p><strong>{formatMoney(Number(stats.totals.expense))}</strong><span className="negative-value">↓ за месяц</span></article>
        <article className="summary-card"><p>Баланс</p><strong className={Number(stats.totals.balance) >= 0 ? "positive-value" : "negative-value"}>{formatMoney(Number(stats.totals.balance))}</strong><span className="muted">Доходы − расходы</span></article>
        <article className="summary-card"><p>Операции</p><strong>{stats.operationCount}</strong><span className="muted">за выбранный месяц</span></article>
      </div>
      <article className="card chart-panel"><div className="card-title"><div><p className="muted">Динамика расходов</p><h2>{selectedMonth}</h2></div><span className="chart-total">{formatMoney(Number(stats.totals.expense))}</span></div><div className="bar-chart" aria-label="Расходы по дням">{dailyExpenses.map((value, index) => <div className="bar-column" key={`${month}-${index + 1}`}><span>{value > 0 ? formatMoney(value) : ""}</span><i style={{ height: `${Math.max(value / maxDailyExpense * 100, value ? 8 : 2)}%` }} /><small>{index + 1} авг</small></div>)}</div></article>
      <article className="card category-panel"><div className="card-title"><div><p className="muted">Структура расходов</p><h2>По категориям</h2></div><span className="muted">{stats.byCategory.length} категорий</span></div><div className="category-list">{stats.byCategory.length === 0 ? <p className="muted">Нет расходов за этот месяц.</p> : stats.byCategory.map((item) => <div className="category-row" key={item.categoryId}><span className="category-dot" style={{ background: categories.get(item.categoryId)?.color }} /><div><strong>{categories.get(item.categoryId)?.name ?? "Без категории"}</strong><div className="category-track"><i style={{ width: `${item.share * 100}%`, background: categories.get(item.categoryId)?.color }} /></div></div><b>{formatMoney(Number(item.amount))}</b><small>{Math.round(item.share * 100)}%</small></div>)}</div></article>
      <article className="card quick-add"><h2>Добавить расход</h2><form onSubmit={addExpense}><input name="amount" type="number" min="0.01" step="0.01" placeholder="Сумма в ₽" required /><button type="submit">Добавить</button></form></article>
    </section>
  </main>;
}
