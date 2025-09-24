import React from 'react';
import '../App.css';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppTopbar from '../components/Topbar';
import AppFooter from '../components/Footer';

export default function PrivateLayout() {
  const loc = useLocation();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content">
        <AppTopbar
          title={`MODEC • SISTEMA DE CONTROLE DE CONTRATOS`}
          right={'Olá: Mario'}
        />
        <main className="page">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
