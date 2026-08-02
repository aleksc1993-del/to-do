import { useState } from "react";
import { mockCategories, mockOperations, type Operation } from "../entities/finance";
import { OperationForm } from "../features";
import { OperationList } from "../widgets";

export function App() {
  const [operations, setOperations] = useState<Operation[]>([...mockOperations]);
  const [lastOperation, setLastOperation] = useState<Operation | null>(null);

  const handleSubmit = (operation: Operation) => {
    setOperations((current) => [operation, ...current]);
    setLastOperation(operation);
  };

  return (
    <main className="app-shell">
      <div className="ambient-shape" aria-hidden="true" />
      <div className="app-content">
        <OperationForm categories={mockCategories} onSubmit={handleSubmit} />
        <OperationList operations={operations} categories={mockCategories} onDelete={(id) => setOperations((current) => current.filter((operation) => operation.id !== id))} />
      </div>
      {lastOperation && <p className="screen-reader-only">Последняя операция сохранена: {lastOperation.type}</p>}
    </main>
  );
}
