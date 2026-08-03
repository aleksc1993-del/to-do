import { useMemo, useState, type FormEvent } from "react";
import type { Category, CategoryId, IsoDate, Money, Operation, OperationType } from "../../../entities/finance";
import { validateOperationForm, type FormErrors, type FormValues } from "../model/validation";

interface OperationFormProps {
  readonly categories: readonly Category[];
  readonly onSubmit: (operation: Operation) => void;
}

const initialValues: FormValues = {
  type: "expense",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  comment: "",
};

const toBranded = <T,>(value: string | number) => value as T;

export function OperationForm({ categories, onSubmit }: OperationFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.kind === values.type && !category.isArchived),
    [categories, values.type],
  );

  const updateValue = <Field extends keyof FormValues>(field: Field, value: FormValues[Field]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIsSubmitted(false);
  };

  const handleTypeChange = (type: OperationType) => {
    setValues((current) => ({ ...current, type, category: "" }));
    setErrors({});
    setIsSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateOperationForm(values, categories);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      id: toBranded<Operation["id"]>(crypto.randomUUID()),
      type: values.type,
      amount: toBranded<Money>(Math.round(Number(values.amount.replace(",", ".")) * 100)),
      category: toBranded<CategoryId>(values.category),
      date: toBranded<IsoDate>(values.date),
      comment: values.comment.trim(),
    });
    setValues({ ...initialValues, date: new Date().toISOString().slice(0, 10) });
    setIsSubmitted(true);
  };

  return (
    <section className="operation-card" aria-labelledby="operation-form-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Новая запись</p>
          <h1 id="operation-form-title">Добавить операцию</h1>
        </div>
        <span className={`type-badge ${values.type}`}>{values.type === "income" ? "Доход" : "Расход"}</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="type-switcher">
          <legend>Тип операции</legend>
          <div className="type-options">
            {(["expense", "income"] as const).map((type) => (
              <label className={`type-option ${values.type === type ? "selected" : ""}`} key={type}>
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={values.type === type}
                  onChange={() => handleTypeChange(type)}
                />
                <span>{type === "income" ? "Доход" : "Расход"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-grid">
          <label className="field">
            <span>Сумма, ₽</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={values.amount}
              onChange={(event) => updateValue("amount", event.target.value)}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount && <small id="amount-error" className="error">{errors.amount}</small>}
          </label>

          <label className="field">
            <span>Дата</span>
            <input type="date" value={values.date} onChange={(event) => updateValue("date", event.target.value)} aria-invalid={Boolean(errors.date)} />
            {errors.date && <small className="error">{errors.date}</small>}
          </label>

          <label className="field field-wide">
            <span>Категория</span>
            <select value={values.category} onChange={(event) => updateValue("category", event.target.value)} aria-invalid={Boolean(errors.category)}>
              <option value="">Выберите категорию</option>
              {availableCategories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
            </select>
            {errors.category && <small className="error">{errors.category}</small>}
          </label>

          <label className="field field-wide">
            <span>Комментарий <em>необязательно</em></span>
            <textarea rows={3} placeholder="Например, покупки на неделю" value={values.comment} onChange={(event) => updateValue("comment", event.target.value)} />
          </label>
        </div>

        <div className="form-footer">
          {isSubmitted && <p className="success" role="status">Операция добавлена</p>}
          <button type="submit">Добавить операцию <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>
  );
}
