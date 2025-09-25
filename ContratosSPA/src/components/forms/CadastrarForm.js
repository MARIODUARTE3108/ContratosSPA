import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as services from '../../services/account-services';
import '../css/auth.css';

export default function CadastrarForm() {
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { nome: '', email: '', senha: '' }
  });

  const onSubmit = (data) => {
    setMensagemSucesso('');
    setMensagemErro('');

    services.postUsuario(data)
      .then(result => {
        setMensagemSucesso(result?.message || 'Conta criada com sucesso!');
        reset({ nome: '', email: '', senha: '' });
      })
      .catch(e => {
        const status = e?.response?.status;
        if (status === 400 && e.response?.data?.errors) {
          const errs = e.response.data.errors;
          const first =
            errs.Nome?.[0] ||
            errs.Email?.[0] ||
            errs.Senha?.[0] ||
            e.response?.data?.message;
          setMensagemErro(first || 'Verifique os campos e tente novamente.');
        } else if (status === 422) {
          setMensagemErro(e.response?.data || 'Dados inválidos.');
        } else if (status === 500) {
          setMensagemErro(e.response?.data?.message || 'Erro interno.');
        } else {
          setMensagemErro('Não foi possível realizar a operação.');
        }
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
        <label htmlFor="nome">Nome</label>
        <Controller
          name="nome"
          control={control}
          rules={{
            required: 'Informe seu nome',
            minLength: { value: 2, message: 'Mínimo de 2 caracteres' }
          }}
          render={({ field }) => (
            <input id="nome" type="text" placeholder="Seu nome" {...field} />
          )}
        />
        {errors.nome && <p className="error-text">{errors.nome.message}</p>}
      </div>

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
            <input id="email" type="email" placeholder="voce@exemplo.com" {...field} />
          )}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="senha">Senha</label>
        <Controller
          name="senha"
          control={control}
          rules={{
            required: 'Informe sua senha',
            minLength: { value: 4, message: 'Mínimo de 4 caracteres' }
          }}
          render={({ field }) => (
            <input id="senha" type="password" placeholder="••••••••" {...field} />
          )}
        />
        {errors.senha && <p className="error-text">{errors.senha.message}</p>}
      </div>

      <button type="submit" className="btn-primary">Realizar Cadastro</button>
    </form>
  );
}
