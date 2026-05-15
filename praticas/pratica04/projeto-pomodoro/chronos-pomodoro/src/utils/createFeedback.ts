export type FeedbackType = '' | 'success' | 'error';

export type Feedback = {
  type: FeedbackType;
  text: string;
};

export function createFeedback(type: FeedbackType, text: string): Feedback {
  return {
    type,
    text,
  };
}
