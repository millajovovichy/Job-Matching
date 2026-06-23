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
    <div className="flex-1 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
        <i className="fas fa-file-lines text-blue-500"></i>
        简历
      </h3>

      <div className="flex gap-0.5 mb-3 bg-stone-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 text-xs py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'text'
              ? 'bg-white text-slate-800 shadow-sm font-semibold'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <i className="fas fa-pen mr-1.5"></i>粘贴文本
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 text-xs py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'pdf'
              ? 'bg-white text-slate-800 shadow-sm font-semibold'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <i className="fas fa-file-pdf mr-1.5"></i>PDF 上传
        </button>
      </div>

      {activeTab === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴简历文本..."
          className="w-full h-32 text-sm border border-stone-200 rounded-xl p-3.5 resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300
                     placeholder:text-stone-400 transition-shadow bg-stone-50/50"
        />
      )}

      {activeTab === 'pdf' && (
        <div
          {...getRootProps()}
          className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                     cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
              : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
          }`}
        >
          <input {...getInputProps()} />
          {pdfName ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-emerald-500 text-xl mb-1.5"></i>
              <p className="text-sm text-slate-700 font-medium">{pdfName}</p>
              <p className="text-xs text-stone-400 mt-1">点击或拖拽替换文件</p>
            </div>
          ) : (
            <div className="text-center">
              <i className={`fas fa-cloud-upload-alt text-2xl mb-1.5 transition-colors ${isDragActive ? 'text-blue-400' : 'text-stone-300'}`}></i>
              <p className="text-sm text-stone-400">{isDragActive ? '释放以上传' : '拖拽 PDF 到此处或点击上传'}</p>
            </div>
          )}
        </div>
      )}

      {pdfError && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
          <i className="fas fa-circle-exclamation"></i>{pdfError}
        </p>
      )}

      <p className="text-right text-xs text-stone-400 mt-2.5">已输入 {value.length} 字</p>
    </div>
  );
}
