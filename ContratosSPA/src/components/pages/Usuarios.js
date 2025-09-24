import React from 'react'
import UsuarioForm from '../forms/UsuarioForm'


export default function Usuarios() {
  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Página de Usuários</h5>
          <p>Gerenciamento de Usuários</p>

          <UsuarioForm />
        </div>
      </div>
    </div>
  )
}