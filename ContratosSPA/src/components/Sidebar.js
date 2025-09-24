import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as helpers from '../helpers/auth-helper';
import '../App.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const sair = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      helpers.signOut();
      navigate('/', { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="brandline brandline--stack">
        <img src="/assets/logo.png" alt="MODEC" className="brand-wordmark" />
      </div>



      <ul className="navlist">
        <li>
          <NavLink to="/inicio" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/adm" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            Contratos
          </NavLink>
        </li>
        <li>
          <NavLink to="/emp" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            Empresas
          </NavLink>
        </li>
        <li>
          <NavLink to="/usur" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            Usuários
          </NavLink>
        </li>
      </ul>

      <div className="spacer" />
      <button className="logout-btn" onClick={sair}>Sair</button>
    </aside>
  );
}
