import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        © {new Date().getFullYear()} MODEC • Contratos — v1.0
      </div>
    </footer>
  );
}
