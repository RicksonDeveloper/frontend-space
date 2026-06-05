import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import logoUrl from '../../assets/chronos-logo.svg';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { LoginInput } from '../../components/LoginInput';
import { useAuth } from '../../contexts/AuthContext';
import { createFeedback } from '../../utils/createFeedback';
import styles from './styles.module.css';

type ViewMode = 'login' | 'register' | 'recover' | 'reset';

const viewText = {
  login: {
    kicker: 'Acesso seguro',
    title: 'Entrar no sistema',
    description: 'Informe seu e-mail e senha para continuar.',
    button: 'Entrar',
  },
  register: {
    kicker: 'Nova conta',
    title: 'Criar cadastro',
    description: 'Crie uma conta para salvar suas tarefas e configuracoes.',
    button: 'Cadastrar',
  },
  recover: {
    kicker: 'Recuperacao',
    title: 'Esqueci minha senha',
    description: 'Informe seu e-mail para gerar um token temporario de recuperacao.',
    button: 'Gerar token',
  },
  reset: {
    kicker: 'Nova senha',
    title: 'Redefinir senha',
    description: 'Use o token temporario gerado para cadastrar uma nova senha.',
    button: 'Redefinir senha',
  },
};

export function LoginPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const text = viewText[viewMode];

  return (
    <main className={styles.pageShell}>
      <section
        className={styles.layout}
        aria-label='Tela de autenticacao do Chronos Pomodoro'
      >
        <aside className={styles.brandPanel}>
          <div>
            <div className={styles.brandMark} aria-hidden='true'>
              <img src={logoUrl} alt='' />
            </div>
            <h1>Chronos Pomodoro</h1>
            <p>
              Acesse seu painel de foco para organizar ciclos, tarefas e pausas
              com ritmo.
            </p>
          </div>

          <div className={styles.statusRow} aria-label='Resumo do sistema'>
            <span>Sessao real</span>
            <span>Dados por usuario</span>
            <span>Senha com hash</span>
          </div>
        </aside>

        <section className={styles.loginPanel}>
          <p className={styles.panelKicker}>{text.kicker}</p>
          <h2>{text.title}</h2>
          <p>{text.description}</p>
          <AuthForm viewMode={viewMode} setViewMode={setViewMode} />
        </section>
      </section>
    </main>
  );
}

type AuthFormProps = {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
};

function AuthForm({ viewMode, setViewMode }: AuthFormProps) {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(createFeedback('', ''));
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [viewMode]);

  useEffect(() => {
    if (!feedback.text || feedback.type === 'success') return;

    const timeoutId = setTimeout(() => {
      setFeedback(createFeedback('', ''));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [feedback]);

  function validateEmail() {
    if (!email.trim().includes('@')) {
      setFeedback(createFeedback('error', 'Informe um e-mail valido.'));
      return false;
    }

    return true;
  }

  function validatePassword() {
    if (password.length < 6) {
      setFeedback(createFeedback('error', 'A senha precisa ter no minimo 6 caracteres.'));
      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(createFeedback('', ''));

    try {
      setIsSubmitting(true);

      if (viewMode === 'login') {
        if (!validateEmail() || !password) return;
        await login(email, password);
        setFeedback(createFeedback('success', 'Login realizado com sucesso.'));
        navigate('/');
        return;
      }

      if (viewMode === 'register') {
        if (name.trim().length < 2 || !validateEmail() || !validatePassword()) {
          if (name.trim().length < 2) {
            setFeedback(createFeedback('error', 'Informe seu nome.'));
          }
          return;
        }

        if (password !== confirmPassword) {
          setFeedback(createFeedback('error', 'As senhas nao conferem.'));
          return;
        }

        await register(name, email, password);
        setFeedback(createFeedback('success', 'Conta criada com sucesso.'));
        navigate('/');
        return;
      }

      if (viewMode === 'recover') {
        if (!validateEmail()) return;
        const response = await forgotPassword(email);
        setResetToken(response.resetToken ?? '');
        setViewMode('reset');
        setFeedback(createFeedback('success', response.resetToken ? `Token gerado: ${response.resetToken}` : response.message));
        return;
      }

      if (!resetToken.trim() || !validatePassword()) {
        if (!resetToken.trim()) {
          setFeedback(createFeedback('error', 'Informe o token de recuperacao.'));
        }
        return;
      }

      const message = await resetPassword(resetToken, password);
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setViewMode('login');
      setFeedback(createFeedback('success', message));
    } catch (error) {
      setFeedback(createFeedback('error', error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeViewMode(nextViewMode: ViewMode) {
    setViewMode(nextViewMode);
    setFeedback(createFeedback('', ''));
    setPassword('');
    setConfirmPassword('');
  }

  const text = viewText[viewMode];

  return (
    <form onSubmit={handleSubmit}>
      {viewMode === 'register' && (
        <LoginInput
          id='name'
          label='Nome'
          value={name}
          onChange={setName}
          placeholder='Seu nome'
        />
      )}

      {viewMode !== 'reset' && (
        <LoginInput
          inputRef={emailRef}
          id='email'
          label='E-mail'
          type='email'
          value={email}
          onChange={setEmail}
          placeholder='voce@email.com'
        />
      )}

      {viewMode === 'reset' && (
        <LoginInput
          id='resetToken'
          label='Token'
          value={resetToken}
          onChange={setResetToken}
          placeholder='Token recebido'
          inputRef={emailRef}
        />
      )}

      {viewMode !== 'recover' && (
        <LoginInput
          id='password'
          label={viewMode === 'reset' ? 'Nova senha' : 'Senha'}
          type='password'
          value={password}
          onChange={setPassword}
          placeholder='Minimo 6 caracteres'
        />
      )}

      {viewMode === 'register' && (
        <LoginInput
          id='confirmPassword'
          label='Confirmar senha'
          type='password'
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder='Repita sua senha'
        />
      )}

      <button className={styles.primaryButton} type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : text.button}
      </button>

      <div className={styles.authActions}>
        {viewMode !== 'login' && (
          <button type='button' onClick={() => changeViewMode('login')}>
            Voltar para login
          </button>
        )}

        {viewMode === 'login' && (
          <>
            <button type='button' onClick={() => changeViewMode('register')}>
              Nao tem conta? Cadastre-se
            </button>
            <button type='button' onClick={() => changeViewMode('recover')}>
              Esqueci minha senha
            </button>
          </>
        )}

        {viewMode === 'recover' && (
          <button type='button' onClick={() => changeViewMode('reset')}>
            Ja tenho um token
          </button>
        )}
      </div>

      <FeedbackMessage feedback={feedback} />

      {viewMode === 'login' && (
        <p className={styles.mockAccess}>
          Usuario de teste: <strong>teste@chronos.com</strong>
          <br />
          Senha de teste: <strong>123456</strong>
        </p>
      )}

      {viewMode === 'reset' && (
        <p className={styles.mockAccess}>
          Em laboratorio, o backend tambem imprime o token no console da API.
        </p>
      )}
    </form>
  );
}
