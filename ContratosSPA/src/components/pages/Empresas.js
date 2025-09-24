import React from 'react'
import EmpresaForm from '../forms/EmpresaForm'

export default function Empresas() {
  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Página de Empresas</h5>
          <p>Gerenciamento de Empresas</p>

          <EmpresaForm />
        </div>
      </div>
    </div>
  )
}