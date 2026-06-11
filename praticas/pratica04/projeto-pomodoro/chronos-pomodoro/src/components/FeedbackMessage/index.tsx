import type { Feedback } from '../../utils/createFeedback';
import styles from './styles.module.css';

type FeedbackMessageProps = {
  feedback: Feedback;
};

export function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback.text) {
    return null;
  }

  const statusClass = feedback.type ? styles[feedback.type] : '';

  return (
    <div
      className={`${styles.feedback} ${statusClass}`}
      role='status'
      aria-live='polite'
    >
      <span>{feedback.text}</span>
    </div>
  );
}
