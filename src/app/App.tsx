import { useEffect, useMemo, useState, type FormEvent } from "react";
import { calculateMonthlyStatistics, calculateTrend, mockCategories, mockOperations, type CategoryId, type Money, type Operation } from "../entities/finance";
import { createLocalStorageAdapter } from "../shared";
import "./statistics.css";

const storage = createLocalStorageAdapter<Operation[]>({ key: "expense-calculator.operations", isValue: (value): value is Operation[] => Array.isArray(value) });
const moneyFormatter = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const formatMoney = (amount: number) => moneyFormatter.format(amount / 100);

export function App() {
  const [operations, setOperations] = useState<Operation[]>(() => storage.load() ?? [...mockOperations]);
  const [month, setMonth] = useState("2026-08");
  const [trendMode, setTrendMode] = useState<"day" | "month">("day");
  useEffect(() => { storage.save(operations); }, [operations]);

  const stats = useMemo(() => calculateMonthlyStatistics(operations, month, "RUB", mockCategories), [operations, month]);
  const categories = useMemo(() => new Map(mockCategories.map((category) => [category.id, category])), []);
  const trend = useMemo(() => calculateTrend(operations, month, trendMode), [operations, month, trendMode]);
  const maxTrendValue = Math.max(...trend.flatMap((point) => [Number(point.income), Number(point.expense)]), 1);
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
      <article className="card chart-panel"><div className="card-title"><div><p className="muted">Динамика доходов и расходов</p><h2>{selectedMonth}</h2></div><div className="chart-controls"><button className={trendMode === "day" ? "selected" : ""} type="button" onClick={() => setTrendMode("day")}>Дни</button><button className={trendMode === "month" ? "selected" : ""} type="button" onClick={() => setTrendMode("month")}>Месяцы</button></div></div><div className="chart-legend"><span><i className="legend-income" />Доходы</span><span><i className="legend-expense" />Расходы</span></div><div className="bar-chart" aria-label="Динамика доходов и расходов">{trend.map((point) => <div className="bar-column" key={`${trendMode}-${point.label}`}><span>{Number(point.income) || Number(point.expense) ? formatMoney(Math.max(Number(point.income), Number(point.expense))) : ""}</span><div className="bar-pair"><i className="income-bar" style={{ height: `${Number(point.income) / maxTrendValue * 100}%` }} /><i className="expense-bar" style={{ height: `${Number(point.expense) / maxTrendValue * 100}%` }} /></div><small>{trendMode === "day" ? point.label : `${point.label} мес.`}</small></div>)}</div></article>
      <article className="card category-panel"><div className="card-title"><div><p className="muted">Структура расходов</p><h2>По категориям</h2></div><span className="muted">{stats.byCategory.length} категорий</span></div><div className="category-list">{stats.byCategory.length === 0 ? <p className="muted">Нет расходов за этот месяц.</p> : stats.byCategory.map((item) => <div className="category-row" key={item.categoryId}><span className="category-dot" style={{ background: categories.get(item.categoryId)?.color }} /><div><strong>{categories.get(item.categoryId)?.name ?? "Без категории"}</strong><div className="category-track"><i style={{ width: `${item.share * 100}%`, background: categories.get(item.categoryId)?.color }} /></div></div><b>{formatMoney(Number(item.amount))}</b><small>{Math.round(item.share * 100)}%</small></div>)}</div></article>
      <article className="card quick-add"><h2>Добавить расход</h2><form onSubmit={addExpense}><input name="amount" type="number" min="0.01" step="0.01" placeholder="Сумма в ₽" required /><button type="submit">Добавить</button></form></article>
    </section>
  </main>;
}
