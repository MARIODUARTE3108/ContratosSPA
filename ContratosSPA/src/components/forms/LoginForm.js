import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as services from '../../services/account-services';
import * as helper from '../../helpers/auth-helper';
import '../css/login.css';

export default function LoginForm() {
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (data) => {
    setMensagemErro('');
    services.postLogin(data)
      .then(result => {
        helper.signIn(result);
        window.location = '/inicio';
      })
      .catch(e => {
        switch (e.response?.status) {
          case 401:
            setMensagemErro(e.response.data);
            break;
          default:
            setMensagemErro('Operação não pode ser realizada');
            break;
        }
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      {mensagemSucesso && (
        <div className="alert success">
          <strong>Sucesso!</strong> {mensagemSucesso}
        </div>
      )}
      {mensagemErro && (
        <div className="alert error">
          <strong>Erro!</strong> {mensagemErro}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">E-mail</label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Informe seu e-mail',
            pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido' }
          }}
          render={({ field }) => (
            <input id="email" type="email" placeholder="voce@modec.com" {...field} />
          )}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Informe sua senha',
            minLength: { value: 4, message: 'Mínimo de 4 caracteres' }
          }}
          render={({ field }) => (
            <input id="password" type="password" placeholder="••••••••" {...field} />
          )}
        />
        {errors.password && <p className="error-text">{errors.password.message}</p>}
      </div>

      <button type="submit" className="btn-primary">Entrar</button>
    </form>
  );
}
