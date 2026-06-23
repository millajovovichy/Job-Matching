import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractTextFromPDF } from '../utils/pdfParser';

export default function ResumeCard({ value, onChange }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'pdf'
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
    <div className="flex-1 bg-white rounded-xl border-2 border-dashed border-gray-300 p-4">
      <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <i className="fas fa-file-lines text-blue-500"></i>
        简历
      </h3>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            activeTab === 'text'
              ? 'bg-white text-gray-800 shadow-sm font-medium'
              : 'text-gray-500'
          }`}
        >
          <i className="fas fa-pen mr-1"></i>
          粘贴文本
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
            activeTab === 'pdf'
              ? 'bg-white text-gray-800 shadow-sm font-medium'
              : 'text-gray-500'
          }`}
        >
          <i className="fas fa-file-pdf mr-1"></i>
          PDF 上传
        </button>
      </div>

      {/* 文本输入 */}
      {activeTab === 'text' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="粘贴简历文本..."
          className="w-full h-32 text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      )}

      {/* PDF 上传 */}
      {activeTab === 'pdf' && (
        <div
          {...getRootProps()}
          className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          {pdfName ? (
            <div className="text-center">
              <i className="fas fa-check-circle text-green-500 text-xl mb-1"></i>
              <p className="text-sm text-gray-700">{pdfName}</p>
              <p className="text-xs text-gray-400 mt-1">点击或拖拽替换文件</p>
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">
                {isDragActive ? '释放以上传' : '拖拽 PDF 到此处或点击上传'}
              </p>
            </div>
          )}
        </div>
      )}

      {pdfError && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <i className="fas fa-circle-exclamation"></i>
          {pdfError}
        </p>
      )}

      <p className="text-right text-xs text-gray-400 mt-2">
        已输入 {value.length} 字
      </p>
    </div>
  );
}
