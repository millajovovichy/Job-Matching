import ResumeCard from './ResumeCard';
import JdCard from './JdCard';

export default function InputPanel({ resumeText, jdText, onResumeChange, onJdChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 stagger-1 animate-fade-in-up">
      <ResumeCard value={resumeText} onChange={onResumeChange} />
      <JdCard value={jdText} onChange={onJdChange} />
    </div>
  );
}
