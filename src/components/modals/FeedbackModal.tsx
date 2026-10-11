import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [category, setCategory] = useState<string>('pronunciation');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(`Category: ${category}, Rating: ${rating}/5, Note: ${comment}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-space-lg py-4 border-b border-outline-variant bg-surface-bright">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">feedback</span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Product Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="p-space-xl text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center mx-auto text-2xl">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h3 className="font-headline-sm text-primary font-bold">Thank You!</h3>
            <p className="text-sm text-on-surface-variant">
              Your feedback helps shape Nipp-ON's learning experience.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
            <div>
              <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                Area of Experience
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-bright text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="pronunciation">Voice Pronunciation & Pitch Accent</option>
                <option value="ai-tutor">AI Sensei Tutor Dialogue</option>
                <option value="vocab-search">Vocabulary Analysis & Search</option>
                <option value="quizzes">Practice Quizzes & Scoring</option>
                <option value="general">General Design & Accessibility</option>
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                Overall Satisfaction
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95"
                  >
                    <span
                      className={`material-symbols-outlined ${
                        star <= rating ? 'text-secondary fill-icon' : 'text-outline-variant'
                      }`}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                Notes & Suggestions
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on the learning flow or design..."
                className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-bright text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-xs"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
