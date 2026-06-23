import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractTextFromPDF } from '../utils/pdfParser';

export default function ResumeCard({ value, onChange }) {
  const [activeTab, setActiveTab] = useState('text');
  const [pdfName, setPdfName] = useState('');
  const [pdfError, setPdfError] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setPdfError('文件过大，请选择 10MB 以内的 PDF');
        return;
      }
      setPdfError('');
      setPdfName(file.name);
      try {
        const text = await extractTextFromPDF(file);
        onChange(text);
        setPdfError('');
      } catch {
        setPdfError('PDF 解析失败，请尝试粘贴文本方式');
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <i className="fas fa-file-lines text-indigo-500 text-xs"></i>
        </span>
        简历
      </h3>

      {/* Tab tabs */}
      <div className="flex gap-0.5 mb-3 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 text-xs py-2 rounded-md transition-all duration-200 ${
            activeTab === 'text'
              ? 'bg-white text-slate-900 shadow-sm font-medium'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="fas fa-pen mr-1.5"></i>
          粘贴文本
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 text-xs py-2 rounded-md transition-all duration-200 ${
            activeTab === 'pdf'
              ? 'bg-white text-slate-900 shadow-sm font-medium'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="fas fa-file-pdf mr-1.5"></i>
          PDF 上传
        </button>
      </div>

      {activeTab === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴简历文本..."
          className="w-full h-36 text-sm border border-slate-200 rounded-xl p-3.5 resize-none
                     focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300
                     placeholder:text-slate-400 transition-shadow"
        />
      )}

      {activeTab === 'pdf' && (
        <div
          {...getRootProps()}
          className={`h-36 flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                     cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          {pdfName ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-emerald-500 text-xl mb-1.5"></i>
              <p className="text-sm text-slate-700 font-medium">{pdfName}</p>
              <p className="text-xs text-slate-400 mt-1">点击或拖拽替换文件</p>
            </div>
          ) : (
            <div className="text-center">
              <i className={`fas fa-cloud-upload-alt text-2xl mb-1.5 transition-colors ${isDragActive ? 'text-indigo-400' : 'text-slate-300'}`}></i>
              <p className="text-sm text-slate-400">
                {isDragActive ? '释放以上传' : '拖拽 PDF 到此处或点击上传'}
              </p>
            </div>
          )}
        </div>
      )}

      {pdfError && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
          <i className="fas fa-circle-exclamation"></i>
          {pdfError}
        </p>
      )}

      <p className="text-right text-xs text-slate-400 mt-2.5">
        已输入 {value.length} 字
      </p>
    </div>
  );
}
