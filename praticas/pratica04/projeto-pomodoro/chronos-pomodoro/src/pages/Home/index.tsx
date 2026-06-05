import { useEffect } from 'react';
import { Container } from '../../components/Container';
import { CountDown } from '../../components/CountDown';
import { MainForm } from '../../components/MainForm';
import { useAuth } from '../../contexts/AuthContext';
import { MainTemplate } from '../../templates/MainTemplate';

export function Home() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Fefe Pomodoro';
  }, []);

  return (
    <MainTemplate>
      <Container>
        <p style={{ textAlign: 'center' }}>
          Bem-vindo, <strong>{user?.name ?? user?.email}</strong>.
        </p>
      </Container>

      <Container>
        <CountDown />
      </Container>

      <Container>
        <MainForm />
      </Container>
    </MainTemplate>
  );
}
