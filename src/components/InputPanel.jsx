import ResumeCard from './ResumeCard';
import JdCard from './JdCard';

export default function InputPanel({ resumeText, jdText, onResumeChange, onJdChange }) {
  return (
    <div className="flex gap-3 mb-3">
      <ResumeCard value={resumeText} onChange={onResumeChange} />
      <JdCard value={jdText} onChange={onJdChange} />
    </div>
  );
}
