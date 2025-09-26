import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio';
import AcessarConta from './pages/AcessarConta';
import CadastrarConta from './pages/CadastrarConta';
import Contratos from './pages/Contratos';
import RequireAuth from '../config/RequireAuth';
import PrivateLayout from '../config/PrivateLayout';
import Empresas from './pages/Empresas';
import Usuarios from './pages/Usuarios';

export default function Main() {
  return (
    <Routes>
      <Route path="/" element={<AcessarConta />} />
      <Route path="/cadastrar-conta" element={<CadastrarConta />} />

      <Route element={<RequireAuth />}>
        <Route element={<PrivateLayout />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/emp" element={<Empresas />} />
          <Route path="/adm" element={<Contratos />} />
          <Route path="/usur" element={<Usuarios />} />

        </Route>
      </Route>
    </Routes>
  );
}
