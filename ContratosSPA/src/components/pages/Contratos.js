import React from 'react'
import ContratosForm from '../forms/ContratosForm'


export default function Contratos() {
  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Página de Contratos</h5>
          <p>Gerenciamento de Contratos</p>

          <ContratosForm />
        </div>
      </div>
    </div>
  )
}
