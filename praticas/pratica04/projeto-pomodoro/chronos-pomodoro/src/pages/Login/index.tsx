import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import logoUrl from '../../assets/chronos-logo.svg';
import { FeedbackMessage } from '../../components/FeedbackMessage';
import { LoginActions } from '../../components/LoginActions';
import { LoginInput } from '../../components/LoginInput';
import { FEEDBACK_MESSAGES } from '../../constants/feedbackMessages';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { createFeedback } from '../../utils/createFeedback';
import styles from './styles.module.css';

export function LoginPage() {
  return (
    <main className={styles.pageShell}>
      <section
        className={styles.layout}
        aria-label='Tela de login do Chronos Pomodoro'
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
            <span>25 min foco</span>
            <span>5 min pausa</span>
            <span>Sessao simulada</span>
          </div>
        </aside>

        <section className={styles.loginPanel}>
          <p className={styles.panelKicker}>Acesso inicial</p>
          <h2>Entrar no sistema</h2>
          <p>Informe suas credenciais para continuar.</p>
          <LoginForm />
        </section>
      </section>
    </main>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'recover'>(
    'login',
  );
  const [feedback, setFeedback] = useState(createFeedback('', ''));
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!feedback.text || feedback.type === 'success') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setFeedback(createFeedback('', ''));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [feedback]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setViewMode('login');

    const isValidLogin = login(username, password);

    if (!isValidLogin) {
      setFeedback(createFeedback('error', FEEDBACK_MESSAGES.invalidLogin));
      return;
    }

    setFeedback(createFeedback('success', FEEDBACK_MESSAGES.loginSuccess));
    navigate('/');
  }

  function handleRegister() {
    setViewMode('register');
    setFeedback(createFeedback('', FEEDBACK_MESSAGES.registerUnavailable));
  }

  function handleRecover() {
    setViewMode('recover');
    setFeedback(createFeedback('', FEEDBACK_MESSAGES.recoverUnavailable));
  }

  return (
    <form onSubmit={handleSubmit}>
      <LoginInput
        inputRef={usernameRef}
        id='username'
        label='Usuario'
        value={username}
        onChange={setUsername}
        placeholder={authService.mockUser}
      />

      <LoginInput
        id='password'
        label='Senha'
        type='password'
        value={password}
        onChange={setPassword}
        placeholder='Digite sua senha'
      />

      <button className={styles.primaryButton} type='submit'>
        Entrar
      </button>

      <LoginActions onRegister={handleRegister} onRecover={handleRecover} />
      <FeedbackMessage feedback={feedback} />

      {viewMode !== 'login' && (
        <p className={styles.mockAccess}>
          Modo atual: {viewMode === 'register' ? 'cadastro' : 'recuperacao de senha'}.
        </p>
      )}

      <p className={styles.mockAccess}>
        Usuario de teste: <strong>{authService.mockUser}</strong>
        <br />
        Senha de teste: <strong>{authService.mockPassword}</strong>
      </p>
    </form>
  );
}
