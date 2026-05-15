import styles from './styles.module.css';

type LoginActionsProps = {
  onRegister: () => void;
  onRecover: () => void;
};

export function LoginActions({ onRegister, onRecover }: LoginActionsProps) {
  return (
    <div className={styles.actions}>
      <button className={styles.linkButton} type='button' onClick={onRegister}>
        Nao tem conta? Cadastre-se
      </button>
      <button className={styles.linkButton} type='button' onClick={onRecover}>
        Esqueci minha senha
      </button>
    </div>
  );
}
