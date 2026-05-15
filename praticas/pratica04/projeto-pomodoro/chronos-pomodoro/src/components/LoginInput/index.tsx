import type { Ref } from 'react';
import styles from './styles.module.css';

type LoginInputProps = {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export function LoginInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  inputRef,
}: LoginInputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'current-password' : 'username'}
      />
    </div>
  );
}
