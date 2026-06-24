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
    <div className="flex-1 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5">
      {/* 标题 + Tab 同一行 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <i className="fas fa-file-lines text-blue-400"></i>
          简历
        </h3>
        <div className="flex gap-0.5 bg-white/[0.06] rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setActiveTab('text')}
            className={`text-xs py-1 px-3 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === 'text'
                ? 'bg-white/[0.12] text-white font-semibold'
                : 'text-white/35 hover:text-white/60'
            }`}
          >
            <i className="fas fa-pen mr-1.5"></i>粘贴文本
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`text-xs py-1 px-3 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === 'pdf'
                ? 'bg-white/[0.12] text-white font-semibold'
                : 'text-white/35 hover:text-white/60'
            }`}
          >
            <i className="fas fa-file-pdf mr-1.5"></i>PDF 上传
          </button>
        </div>
      </div>

      {activeTab === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴简历文本..."
          className="w-full h-40 text-sm rounded-xl p-3.5 resize-none
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/[0.06]
                     placeholder:text-white/20 transition-all bg-white/[0.04] text-white border border-transparent"
        />
      )}

      {activeTab === 'pdf' && (
        <div
          {...getRootProps()}
          className={`h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl
                     cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
              : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.04]'
          }`}
        >
          <input {...getInputProps()} />
          {pdfName ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-emerald-400 text-xl mb-1.5"></i>
              <p className="text-sm text-white font-medium">{pdfName}</p>
              <p className="text-xs text-white/35 mt-1">点击或拖拽替换文件</p>
            </div>
          ) : (
            <div className="text-center">
              <i className={`fas fa-cloud-upload-alt text-2xl mb-1.5 transition-colors ${isDragActive ? 'text-indigo-400' : 'text-white/20'}`}></i>
              <p className="text-sm text-white/35">{isDragActive ? '释放以上传' : '拖拽 PDF 到此处或点击上传'}</p>
            </div>
          )}
        </div>
      )}

      {pdfError && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
          <i className="fas fa-circle-exclamation"></i>{pdfError}
        </p>
      )}

      <p className="text-right text-xs text-white/20 mt-2.5">已输入 {value.length} 字</p>
    </div>
  );
}
