import React, { useState, useEffect } from 'react';

export default function Inicio() {
  const [data, setData] = useState({ ativos: 0, vencidos: 0, cancelados: 0 });

  useEffect(() => {
    const mock = { ativos: 120, vencidos: 15, cancelados: 7 };
    setTimeout(() => setData(mock), 500);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <section className="kpi-grid">
        <KpiCard title="Ativos" value={data.ativos} tone="ok" hint="Contratos em vigor" />
        <KpiCard title="Vencidos" value={data.vencidos} tone="warn" hint="Prazo encerrado" />
        <KpiCard title="Cancelados" value={data.cancelados} tone="danger" hint="Rescindidos/baixados" />
      </section>
    </div>
  );
}

function KpiCard({ title, value, hint, tone }) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-head">
        <span className="kpi-title">{title}</span>
        <span className="kpi-hint">{hint}</span>
      </div>
      <div className="kpi-value">{value}</div>
    </article>
  );
}
