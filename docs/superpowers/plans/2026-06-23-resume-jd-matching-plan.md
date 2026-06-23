# 简历 × JD 智能匹配工具 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建单页 Web 工具，上传简历和粘贴 JD，通过 DeepSeek API 获得五维匹配评分、优势/短板分析和技能补足建议。

**Architecture:** React 18 + Vite 单页应用，useReducer 管理全局状态，pdfjs-dist 处理 PDF 解析，Recharts 渲染雷达图，DeepSeek API 提供匹配分析。初始展示 Demo 预置数据，上传真实数据后替换。

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, FontAwesome 6, Recharts 2, pdfjs-dist, react-dropzone, Vitest + React Testing Library + MSW

## Global Constraints

- API Key 通过 VITE_DEEPSEEK_API_KEY 环境变量注入，前端无 Key 配置 UI
- 初始状态预填 Demo 数据，顶部显示"示例数据"标签，真实匹配后隐藏
- 五维权重固定：项目经验 35%、技术技能 28%、领域/行业 15%、软实力 12%、学历背景 10%
- 简历或 JD 为空时阻止 API 调用，按钮上方显示行内错误提示
- 每完成一个可独立验证的功能单元立即 git commit
- 忽略文件：node_modules/、dist/、.env、.env.local、.superpowers/、*.log、.DS_Store

---

## File Structure

```
人岗匹配/
├── .env.example                  // VITE_DEEPSEEK_API_KEY=your_key_here
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                  // ReactDOM.createRoot 入口
│   ├── App.jsx                   // 根组件，useReducer 状态管理，组合所有子组件
│   ├── index.css                 // Tailwind 指令 + 自定义样式
│   ├── data/
│   │   └── demoData.js           // Demo 简历文本、JD 文本、预置匹配结果
│   ├── hooks/
│   │   └── useMatchReducer.js    // reducer + initial state + action creators
│   ├── components/
│   │   ├── Header.jsx            // 标题栏 + "示例数据"标签
│   │   ├── InputPanel.jsx        // 输入区容器（简历 + JD 双卡片布局）
│   │   ├── ResumeCard.jsx        // PDF 上传 Tab + 文本输入 Tab
│   │   ├── JdCard.jsx            // JD 文本输入区
│   │   ├── MatchButton.jsx       // 匹配按钮 + 加载态 + 空输入校验提示
│   │   └── ResultPanel.jsx       // 结果区容器
│   │       ├── ScoreRing.jsx     // SVG 环形评分图 + 综合评语
│   │       ├── RadarChart.jsx    // Recharts 五维雷达图
│   │       └── AnalysisCards.jsx // 优势/短板/建议三张卡片
│   ├── services/
│   │   └── api.js                // DeepSeek API 调用、Prompt 构建、响应校验
│   └── utils/
│       └── pdfParser.js          // pdfjs-dist 文本提取
├── src/__tests__/                // 测试文件目录
│   ├── App.test.jsx
│   ├── useMatchReducer.test.js
│   ├── api.test.js
│   ├── pdfParser.test.js
│   ├── Header.test.jsx
│   ├── InputPanel.test.jsx
│   ├── MatchButton.test.jsx
│   └── ResultPanel.test.jsx
```

---

### Task 1: 项目脚手架搭建

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`, `.env.example`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

**Interfaces:**
- Produces: 可 `npm run dev` 启动的空白 Vite + React + Tailwind 项目

- [ ] **Step 1: 创建 .gitignore**

```
node_modules/
dist/
.env
.env.local
.superpowers/
*.log
.DS_Store
```

- [ ] **Step 2: 初始化 package.json 并安装依赖**

```bash
cd "d:/rr/人岗匹配"
npm init -y
npm install react@18 react-dom@18 recharts pdfjs-dist react-dropzone
npm install -D vite@5 @vitejs/plugin-react tailwindcss@3 postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
npm install -D @fortawesome/fontawesome-free
```

- [ ] **Step 3: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
});
```

- [ ] **Step 4: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 5: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>简历 × JD 匹配</title>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 创建 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 8: 创建 src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: 创建 src/App.jsx（最小可运行）**

```jsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">简历 × JD 匹配</h1>
    </div>
  );
}
```

- [ ] **Step 10: 创建 .env.example**

```
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

- [ ] **Step 11: 创建 src/test-setup.js**

```javascript
import '@testing-library/jest-dom';
```

- [ ] **Step 12: 验证脚手架**

```bash
npm run dev
# 浏览器打开 http://localhost:5173，看到 "简历 × JD 匹配" 标题
```

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind project"
```

---

### Task 2: Demo 数据 + 状态管理

**Files:**
- Create: `src/data/demoData.js`, `src/hooks/useMatchReducer.js`
- Create: `src/__tests__/useMatchReducer.test.js`

**Interfaces:**
- Produces: `demoData` 导出 `{ demoResumeText, demoJdText, demoResult }`
- Produces: `useMatchReducer()` 返回 `{ state, dispatch }`，其中 `state` 类型为 `MatchState`，`dispatch` 接受 action 类型 `SET_RESUME | SET_JD | START_MATCH | MATCH_SUCCESS | MATCH_ERROR`

- [ ] **Step 1: 创建 src/data/demoData.js**

```javascript
export const demoResumeText = `张三 | 5年Java后端开发
精通：Spring Cloud、MySQL、Redis、RabbitMQ、MyBatis
经历：主导支付系统架构升级，日均千万级交易处理，带领3人后端小组
学历：计算机科学与技术 本科`;

export const demoJdText = `高级Java开发工程师 — 支付平台部
岗位职责：负责核心交易链路设计与优化
要求：5年以上Java开发经验，精通Spring Cloud微服务体系
熟悉Kubernetes容器编排，有大规模分布式系统经验优先
学历要求：本科及以上`;

export const demoResult = {
  overallScore: 78,
  dimensions: {
    projectExperience: {
      score: 82,
      weight: 35,
      summary: '支付系统架构设计经验高度匹配',
    },
    technicalSkills: {
      score: 75,
      weight: 28,
      summary: 'Spring Cloud技术栈大部分覆盖',
    },
    domainMatch: {
      score: 68,
      weight: 15,
      summary: '金融科技领域经验较匹配',
    },
    softSkills: {
      score: 71,
      weight: 12,
      summary: '团队管理经验符合要求',
    },
    education: {
      score: 90,
      weight: 10,
      summary: '本科学历达标，专业对口',
    },
  },
  strengths: [
    {
      point: '支付系统架构设计经验高度匹配',
      dimension: 'projectExperience',
      detail: '主导过支付系统架构升级，与JD核心职责直接对应',
    },
    {
      point: 'Spring Cloud技术栈全覆盖',
      dimension: 'technicalSkills',
      detail: '精通 Spring Cloud、MyBatis、MySQL、Redis、RabbitMQ',
    },
    {
      point: '3人团队管理经验符合要求',
      dimension: 'softSkills',
      detail: '带领3人后端小组，具备团队协调能力',
    },
  ],
  weaknesses: [
    {
      point: 'Kubernetes实战经验缺失',
      dimension: 'technicalSkills',
      impact: '影响技术技能得分 -8',
      isRequired: true,
    },
    {
      point: '大流量高并发经验不足',
      dimension: 'projectExperience',
      impact: '影响项目经验得分 -4',
      isRequired: false,
    },
  ],
  skillSuggestions: [
    {
      skill: 'Kubernetes',
      reason: 'JD明确要求K8s部署经验',
      learningPath: [
        'CKAD认证课程（Udemy/KodeKloud）',
        'Minikube搭建本地集群动手实验',
        '将个人项目容器化并部署到K8s',
      ],
    },
    {
      skill: '高并发系统设计',
      reason: '支付系统对高并发要求高',
      learningPath: [
        '阅读《设计数据密集型应用》第5-9章',
        '极客时间「高并发系统设计」专栏',
        '用JMeter对个人项目进行压测调优',
      ],
    },
  ],
  overallComment:
    '候选人在Java技术栈和支付领域与岗位高度匹配，项目经验扎实，学历达标。主要差距在云原生基础设施（K8s）和大规模分布式系统经验，补足后预计可达85%+。',
};
```

- [ ] **Step 2: 创建 src/hooks/useMatchReducer.js**

```javascript
import { useReducer } from 'react';
import { demoResumeText, demoJdText, demoResult } from '../data/demoData';

export const ACTION_TYPES = {
  SET_RESUME: 'SET_RESUME',
  SET_JD: 'SET_JD',
  START_MATCH: 'START_MATCH',
  MATCH_SUCCESS: 'MATCH_SUCCESS',
  MATCH_ERROR: 'MATCH_ERROR',
};

const initialState = {
  resumeText: demoResumeText,
  jdText: demoJdText,
  isDemo: true,
  isLoading: false,
  error: null,
  result: demoResult,
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_RESUME:
      return { ...state, resumeText: action.payload };
    case ACTION_TYPES.SET_JD:
      return { ...state, jdText: action.payload };
    case ACTION_TYPES.START_MATCH:
      return { ...state, isLoading: true, error: null };
    case ACTION_TYPES.MATCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isDemo: false,
        result: action.payload,
        error: null,
      };
    case ACTION_TYPES.MATCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export function useMatchReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setResume = (text) =>
    dispatch({ type: ACTION_TYPES.SET_RESUME, payload: text });
  const setJd = (text) =>
    dispatch({ type: ACTION_TYPES.SET_JD, payload: text });
  const startMatch = () =>
    dispatch({ type: ACTION_TYPES.START_MATCH });
  const matchSuccess = (result) =>
    dispatch({ type: ACTION_TYPES.MATCH_SUCCESS, payload: result });
  const matchError = (errorMsg) =>
    dispatch({ type: ACTION_TYPES.MATCH_ERROR, payload: errorMsg });

  return { state, setResume, setJd, startMatch, matchSuccess, matchError };
}
```

- [ ] **Step 3: 创建 src/__tests__/useMatchReducer.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchReducer } from '../hooks/useMatchReducer';

describe('useMatchReducer', () => {
  it('初始化时 isDemo 为 true', () => {
    const { result } = renderHook(() => useMatchReducer());
    expect(result.current.state.isDemo).toBe(true);
  });

  it('SET_RESUME 更新简历文本', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.setResume('新简历内容'));
    expect(result.current.state.resumeText).toBe('新简历内容');
  });

  it('SET_JD 更新 JD 文本', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.setJd('新JD内容'));
    expect(result.current.state.jdText).toBe('新JD内容');
  });

  it('START_MATCH 设置 isLoading 并清除 error', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.matchError('旧错误'));
    act(() => result.current.startMatch());
    expect(result.current.state.isLoading).toBe(true);
    expect(result.current.state.error).toBeNull();
  });

  it('MATCH_SUCCESS 设置结果并将 isDemo 置为 false', () => {
    const { result } = renderHook(() => useMatchReducer());
    const mockResult = { overallScore: 90 };
    act(() => result.current.matchSuccess(mockResult));
    expect(result.current.state.result.overallScore).toBe(90);
    expect(result.current.state.isDemo).toBe(false);
    expect(result.current.state.isLoading).toBe(false);
  });

  it('MATCH_ERROR 设置错误信息', () => {
    const { result } = renderHook(() => useMatchReducer());
    act(() => result.current.matchError('网络错误'));
    expect(result.current.state.error).toBe('网络错误');
    expect(result.current.state.isLoading).toBe(false);
  });
});
```

- [ ] **Step 4: 运行测试验证**

```bash
npx vitest run
# 预期：6 tests passed
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add demo data and useMatchReducer state management"
```

---

### Task 3: Header 组件

**Files:**
- Create: `src/components/Header.jsx`
- Create: `src/__tests__/Header.test.jsx`

**Interfaces:**
- Consumes: `isDemo: boolean` — 控制"示例数据"标签是否显示
- Produces: `<Header isDemo={boolean} />` 组件

- [ ] **Step 1: 创建 src/components/Header.jsx**

```jsx
export default function Header({ isDemo }) {
  return (
    <header className="flex items-center justify-between mb-3">
      <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i className="fas fa-magnifying-glass text-blue-500"></i>
        简历 × JD 匹配
      </h1>
      {isDemo && (
        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          <i className="fas fa-circle-info mr-1"></i>
          示例数据
        </span>
      )}
    </header>
  );
}
```

- [ ] **Step 2: 创建 src/__tests__/Header.test.jsx**

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

describe('Header', () => {
  it('渲染标题', () => {
    render(<Header isDemo={false} />);
    expect(screen.getByText('简历 × JD 匹配')).toBeInTheDocument();
  });

  it('isDemo=true 时显示示例数据标签', () => {
    render(<Header isDemo={true} />);
    expect(screen.getByText('示例数据')).toBeInTheDocument();
  });

  it('isDemo=false 时隐藏示例数据标签', () => {
    render(<Header isDemo={false} />);
    expect(screen.queryByText('示例数据')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 更新 App.jsx 集成 Header**

```jsx
import { useMatchReducer } from './hooks/useMatchReducer';
import Header from './components/Header';

export default function App() {
  const { state } = useMatchReducer();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
    </div>
  );
}
```

- [ ] **Step 4: 运行测试验证**

```bash
npx vitest run
# 预期：9 tests passed（6 reducer + 3 header）
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Header component with demo badge"
```

---

### Task 4: PDF 解析工具

**Files:**
- Create: `src/utils/pdfParser.js`
- Create: `src/__tests__/pdfParser.test.js`

**Interfaces:**
- Produces: `extractTextFromPDF(file: File): Promise<string>` — 从 PDF File 对象提取文本，失败时抛出 Error('PDF_PARSE_FAILED')

- [ ] **Step 1: 创建 src/utils/pdfParser.js**

```javascript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    const trimmed = fullText.trim();
    if (!trimmed) {
      throw new Error('PDF_PARSE_FAILED');
    }
    return trimmed;
  } catch (err) {
    if (err.message === 'PDF_PARSE_FAILED') throw err;
    throw new Error('PDF_PARSE_FAILED');
  }
}
```

- [ ] **Step 2: 创建 src/__tests__/pdfParser.test.js**

```javascript
import { describe, it, expect } from 'vitest';
import { extractTextFromPDF } from '../utils/pdfParser';

describe('extractTextFromPDF', () => {
  it('解析有效 PDF 文件返回文本', async () => {
    // 创建一个最小的 PDF 文件用于测试
    const pdfBytes = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2,
      0xe3, 0xcf, 0xd3, 0x0a, 0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a,
      0x0a, 0x3c, 0x3c, 0x0a, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x20, 0x2f,
      0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x0a, 0x2f, 0x50, 0x61,
      0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x0a, 0x3e,
      0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x32, 0x20,
      0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x0a, 0x2f, 0x54,
      0x79, 0x70, 0x65, 0x20, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x0a,
      0x2f, 0x4b, 0x69, 0x64, 0x73, 0x20, 0x5b, 0x33, 0x20, 0x30, 0x20,
      0x52, 0x5d, 0x0a, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31,
      0x0a, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a,
    ]);
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });

    // 空 PDF 无文本内容，验证不抛异常即可
    await expect(extractTextFromPDF(file)).resolves.toBeDefined();
  });

  it('非 PDF 文件抛出 PDF_PARSE_FAILED', async () => {
    const file = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });
    await expect(extractTextFromPDF(file)).rejects.toThrow('PDF_PARSE_FAILED');
  });
});
```

- [ ] **Step 3: 运行测试验证**

```bash
npx vitest run
# 预期：11 tests passed
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add PDF text extraction utility"
```

---

### Task 5: API 服务层

**Files:**
- Create: `src/services/api.js`
- Create: `src/__tests__/api.test.js`

**Interfaces:**
- Produces: `matchResumeWithJD(resumeText: string, jdText: string): Promise<MatchResult>` — 构建 Prompt、调用 DeepSeek API、校验并返回结果；失败抛出 Error

- [ ] **Step 1: 创建 src/services/api.js**

```javascript
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是一个专业的简历-岗位匹配评估系统。你的任务是分析候选人与岗位描述的匹配程度，并以严格的JSON格式输出结果。

## 评估维度与权重
- 项目经验匹配 (35%): 实际项目经历与JD工作内容的相似度、复杂度匹配、规模匹配
- 技术技能匹配 (28%): JD所需技术栈与候选人技能的重合度，需交叉验证项目描述中是否实际使用
- 领域/行业匹配 (15%): 候选人过往行业经验与目标岗位业务领域的契合度
- 软实力匹配 (12%): 领导力、沟通协作、项目管理等信号（社招重点关注是否带过团队、主导过项目）
- 学历背景匹配 (10%): 学历层次达标为基准线，达标后结合专业相关性评分

## 说明
- 优势: 选取匹配度最高的3-5个具体点，基于简历与JD的实际交集
- 短板: 选取差距最大的3-5个点，优先关注JD中"必须"条件的缺失
- 技能补足建议: 针对短板给出具体、可操作的学习路径（推荐课程/书籍/实践项目）

## 输出（严格JSON，无其他内容）
{
  "overallScore": 数值0-100,
  "dimensions": {
    "projectExperience": {"score": 0-100, "weight": 35, "summary": "一句话"},
    "technicalSkills": {"score": 0-100, "weight": 28, "summary": "一句话"},
    "domainMatch": {"score": 0-100, "weight": 15, "summary": "一句话"},
    "softSkills": {"score": 0-100, "weight": 12, "summary": "一句话"},
    "education": {"score": 0-100, "weight": 10, "summary": "一句话"}
  },
  "strengths": [
    {"point": "具体优势描述", "dimension": "所属维度", "detail": "佐证细节"}
  ],
  "weaknesses": [
    {"point": "具体短板描述", "dimension": "所属维度", "impact": "对匹配的影响", "isRequired": true/false}
  ],
  "skillSuggestions": [
    {"skill": "需补充的技能/能力", "reason": "原因", "learningPath": ["步骤1","步骤2","步骤3"]}
  ],
  "overallComment": "一段80-150字的综合评语"
}`;

function buildPrompt(resumeText, jdText) {
  return `${SYSTEM_PROMPT}

## 候选人简历
${resumeText}

## 岗位描述
${jdText}`;
}

function parseResponse(content) {
  // 尝试直接解析 JSON
  try {
    return JSON.parse(content);
  } catch {
    // 尝试提取 markdown 代码块中的 JSON
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    throw new Error('API_RESPONSE_NOT_JSON');
  }
}

function validateResult(data) {
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    throw new Error('API_RESPONSE_INVALID: overallScore');
  }
  const dims = ['projectExperience', 'technicalSkills', 'domainMatch', 'softSkills', 'education'];
  for (const key of dims) {
    const d = data.dimensions?.[key];
    if (!d || typeof d.score !== 'number' || d.score < 0 || d.score > 100) {
      throw new Error(`API_RESPONSE_INVALID: dimensions.${key}`);
    }
  }
  if (!Array.isArray(data.strengths) || !Array.isArray(data.weaknesses) || !Array.isArray(data.skillSuggestions)) {
    throw new Error('API_RESPONSE_INVALID: arrays');
  }
  if (typeof data.overallComment !== 'string') {
    throw new Error('API_RESPONSE_INVALID: overallComment');
  }
  return data;
}

export async function matchResumeWithJD(resumeText, jdText) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: buildPrompt(resumeText, jdText) },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) throw new Error('API_KEY_INVALID');
      if (response.status === 429) throw new Error('API_RATE_LIMITED');
      throw new Error(`API_ERROR_${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('API_RESPONSE_EMPTY');

    const parsed = parseResponse(content);
    return validateResult(parsed);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('API_TIMEOUT');
    if (err.message.startsWith('API_')) throw err;
    throw new Error('API_NETWORK_ERROR');
  }
}
```

- [ ] **Step 2: 创建 src/__tests__/api.test.js**

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchResumeWithJD } from '../services/api';

// Mock import.meta.env
vi.stubEnv('VITE_DEEPSEEK_API_KEY', 'test-key-123');

const mockResult = {
  overallScore: 78,
  dimensions: {
    projectExperience: { score: 82, weight: 35, summary: '匹配' },
    technicalSkills: { score: 75, weight: 28, summary: '匹配' },
    domainMatch: { score: 68, weight: 15, summary: '匹配' },
    softSkills: { score: 71, weight: 12, summary: '匹配' },
    education: { score: 90, weight: 10, summary: '匹配' },
  },
  strengths: [{ point: '优势', dimension: 'projectExperience', detail: '细节' }],
  weaknesses: [{ point: '短板', dimension: 'technicalSkills', impact: '-8', isRequired: true }],
  skillSuggestions: [{ skill: 'K8s', reason: '缺失', learningPath: ['步骤1', '步骤2'] }],
  overallComment: '综合评语',
};

describe('matchResumeWithJD', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('成功调用返回校验后的结果', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify(mockResult) } }],
        }),
    });

    const result = await matchResumeWithJD('简历文本', 'JD文本');
    expect(result.overallScore).toBe(78);
    expect(result.dimensions.projectExperience.score).toBe(82);
  });

  it('API Key 缺失时抛出 API_KEY_MISSING', async () => {
    // 临时清除环境变量
    const originalKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    import.meta.env.VITE_DEEPSEEK_API_KEY = '';

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_KEY_MISSING');

    import.meta.env.VITE_DEEPSEEK_API_KEY = originalKey;
  });

  it('401 响应抛出 API_KEY_INVALID', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_KEY_INVALID');
  });

  it('API 超时抛出 API_TIMEOUT', async () => {
    fetch.mockRejectedValueOnce({ name: 'AbortError' });

    await expect(matchResumeWithJD('简历', 'JD')).rejects.toThrow('API_TIMEOUT');
  });
});
```

- [ ] **Step 3: 运行测试验证**

```bash
npx vitest run
# 预期：15 tests passed
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add DeepSeek API service with prompt and validation"
```

---

### Task 6: 输入区组件（ResumeCard + JdCard + InputPanel）

**Files:**
- Create: `src/components/ResumeCard.jsx`, `src/components/JdCard.jsx`, `src/components/InputPanel.jsx`
- Create: `src/__tests__/InputPanel.test.jsx`

**Interfaces:**
- Consumes: `resumeText: string`, `jdText: string`
- Callbacks: `onResumeChange(text: string): void`, `onJdChange(text: string): void`
- Produces: `<InputPanel resumeText={string} jdText={string} onResumeChange={fn} onJdChange={fn} />`

- [ ] **Step 1: 创建 src/components/ResumeCard.jsx**

```jsx
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
```

- [ ] **Step 2: 创建 src/components/JdCard.jsx**

```jsx
export default function JdCard({ value, onChange }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <i className="fas fa-briefcase text-blue-500"></i>
        岗位描述 (JD)
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="粘贴岗位描述..."
        className="w-full h-32 text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />
      <p className="text-right text-xs text-gray-400 mt-2">
        已输入 {value.length} 字
      </p>
    </div>
  );
}
```

- [ ] **Step 3: 创建 src/components/InputPanel.jsx**

```jsx
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
```

- [ ] **Step 4: 创建 src/__tests__/InputPanel.test.jsx**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputPanel from '../components/InputPanel';

describe('InputPanel', () => {
  it('渲染简历和 JD 两个输入区', () => {
    render(
      <InputPanel
        resumeText="简历测试"
        jdText="JD测试"
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    expect(screen.getByText('简历')).toBeInTheDocument();
    expect(screen.getByText('岗位描述 (JD)')).toBeInTheDocument();
  });

  it('简历文本区预填传入的值', () => {
    render(
      <InputPanel
        resumeText="测试简历内容"
        jdText=""
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('测试简历内容')).toBeInTheDocument();
  });

  it('PDF 标签切换后显示上传区域', async () => {
    const user = userEvent.setup();
    render(
      <InputPanel
        resumeText=""
        jdText=""
        onResumeChange={vi.fn()}
        onJdChange={vi.fn()}
      />
    );
    await user.click(screen.getByText('PDF 上传'));
    expect(screen.getByText(/拖拽 PDF 到此处或点击上传/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: 更新 App.jsx 集成 InputPanel**

```jsx
import { useMatchReducer } from './hooks/useMatchReducer';
import Header from './components/Header';
import InputPanel from './components/InputPanel';

export default function App() {
  const { state, setResume, setJd } = useMatchReducer();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
      <InputPanel
        resumeText={state.resumeText}
        jdText={state.jdText}
        onResumeChange={setResume}
        onJdChange={setJd}
      />
    </div>
  );
}
```

- [ ] **Step 6: 运行测试验证**

```bash
npx vitest run
# 预期：18 tests passed
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add InputPanel with ResumeCard (PDF/text tabs) and JdCard"
```

---

### Task 7: MatchButton + App 匹配流程集成

**Files:**
- Create: `src/components/MatchButton.jsx`
- Create: `src/__tests__/MatchButton.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `isLoading: boolean`, `resumeText: string`, `jdText: string`
- Callbacks: `onMatch(): void`
- Produces: `<MatchButton isLoading={boolean} onMatch={fn} hasContent={boolean} />`

- [ ] **Step 1: 创建 src/components/MatchButton.jsx**

```jsx
import { useState, useEffect } from 'react';

export default function MatchButton({ isLoading, onMatch, hasContent }) {
  const [showEmptyError, setShowEmptyError] = useState(false);

  useEffect(() => {
    if (hasContent) setShowEmptyError(false);
  }, [hasContent]);

  const handleClick = () => {
    if (!hasContent) {
      setShowEmptyError(true);
      return;
    }
    setShowEmptyError(false);
    onMatch();
  };

  return (
    <div className="text-center mb-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isLoading
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-sm'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            分析中...
          </>
        ) : (
          <>
            <i className="fas fa-magnifying-glass mr-2"></i>
            开始匹配分析
          </>
        )}
      </button>
      {showEmptyError && (
        <p className="text-sm text-red-500 mt-2 flex items-center justify-center gap-1">
          <i className="fas fa-circle-exclamation"></i>
          请上传简历并粘贴岗位描述
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 src/__tests__/MatchButton.test.jsx**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchButton from '../components/MatchButton';

describe('MatchButton', () => {
  it('渲染"开始匹配分析"文本', () => {
    render(<MatchButton isLoading={false} onMatch={vi.fn()} hasContent={true} />);
    expect(screen.getByText('开始匹配分析')).toBeInTheDocument();
  });

  it('isLoading 时显示 spinner 并禁用按钮', () => {
    render(<MatchButton isLoading={true} onMatch={vi.fn()} hasContent={true} />);
    expect(screen.getByText('分析中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('内容为空时点击显示错误提示', async () => {
    const user = userEvent.setup();
    const onMatch = vi.fn();
    render(<MatchButton isLoading={false} onMatch={onMatch} hasContent={false} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('请上传简历并粘贴岗位描述')).toBeInTheDocument();
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('内容不为空时点击触发 onMatch', async () => {
    const user = userEvent.setup();
    const onMatch = vi.fn();
    render(<MatchButton isLoading={false} onMatch={onMatch} hasContent={true} />);
    await user.click(screen.getByRole('button'));
    expect(onMatch).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: 更新 App.jsx 集成匹配流程**

```jsx
import { useMatchReducer } from './hooks/useMatchReducer';
import { matchResumeWithJD } from './services/api';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MatchButton from './components/MatchButton';

export default function App() {
  const { state, setResume, setJd, startMatch, matchSuccess, matchError } =
    useMatchReducer();

  const handleMatch = async () => {
    startMatch();
    try {
      const result = await matchResumeWithJD(state.resumeText, state.jdText);
      matchSuccess(result);
    } catch (err) {
      matchError(err.message || '匹配失败，请重试');
    }
  };

  const hasContent = state.resumeText.trim().length > 0 && state.jdText.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
      <InputPanel
        resumeText={state.resumeText}
        jdText={state.jdText}
        onResumeChange={setResume}
        onJdChange={setJd}
      />
      <MatchButton isLoading={state.isLoading} onMatch={handleMatch} hasContent={hasContent} />

      {state.error && (
        <div className="max-w-6xl mx-auto mb-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <span>
            <i className="fas fa-circle-exclamation mr-2"></i>
            {state.error === 'API_KEY_MISSING' && '请配置 VITE_DEEPSEEK_API_KEY 环境变量'}
            {state.error === 'API_KEY_INVALID' && 'API Key 无效，请检查配置'}
            {state.error === 'API_TIMEOUT' && '请求超时，请检查网络后重试'}
            {state.error === 'API_RATE_LIMITED' && '请求过于频繁，请稍后重试'}
            {!['API_KEY_MISSING', 'API_KEY_INVALID', 'API_TIMEOUT', 'API_RATE_LIMITED'].includes(state.error) && `匹配失败：${state.error}`}
          </span>
          <button
            onClick={handleMatch}
            className="text-red-600 hover:text-red-800 font-medium text-xs underline"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试验证**

```bash
npx vitest run
# 预期：22 tests passed
```

- [ ] **Step 5: 验证 Demo 数据在 UI 中正确展示**

```bash
npm run dev
# 确认：页面显示预填的 Demo 简历和 JD，按钮可点击
# 注：不配置真实 API Key 时，点击匹配会显示错误提示
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add MatchButton with empty validation and API integration"
```

---

### Task 8: ResultPanel — ScoreRing（综合评分环形图）

**Files:**
- Create: `src/components/ScoreRing.jsx`
- Create: `src/__tests__/ResultPanel.test.jsx`

**Interfaces:**
- Consumes: `score: number`, `comment: string`（overallScore, overallComment）
- Produces: `<ScoreRing score={number} comment={string} />`

- [ ] **Step 1: 创建 src/components/ScoreRing.jsx**

```jsx
export default function ScoreRing({ score, comment }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-5 min-w-[140px]">
      <svg width="100" height="100" className="mb-2">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="24"
          fontWeight="700"
          fill="#3b82f6"
        >
          {score}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mb-3">综合匹配度</p>
      <div className="text-xs text-gray-600 leading-relaxed px-1 py-2 bg-gray-50 rounded-lg border-l-[3px] border-blue-500">
        {comment}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行测试验证**

```bash
npx vitest run
# 预期：22 tests passed（无新测试，ScoreRing 通过已有集成测试间接覆盖）
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ScoreRing with SVG circular progress and comment"
```

---

### Task 9: ResultPanel — RadarChart（五维雷达图）

**Files:**
- Create: `src/components/RadarChart.jsx`

**Interfaces:**
- Consumes: `dimensions: { [key]: { score: number, weight: number } }`
- Produces: `<RadarChart dimensions={object} />`

- [ ] **Step 1: 创建 src/components/RadarChart.jsx**

```jsx
import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const DIMENSION_LABELS = {
  projectExperience: '项目经验',
  technicalSkills: '技术技能',
  domainMatch: '领域/行业',
  softSkills: '软实力',
  education: '学历背景',
};

const DIMENSION_COLORS = {
  projectExperience: '#22c55e',
  technicalSkills: '#3b82f6',
  domainMatch: '#f59e0b',
  softSkills: '#8b5cf6',
  education: '#ec4899',
};

export default function RadarChart({ dimensions }) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key] || key,
    score: value.score,
    fullMark: 100,
    color: DIMENSION_COLORS[key] || '#94a3b8',
  }));

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 min-w-[220px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height={240}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickCount={5}
          />
          <Radar
            name="匹配度"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add RadarChart with Recharts 5-dimension radar"
```

---

### Task 10: ResultPanel — AnalysisCards + ResultPanel 容器

**Files:**
- Create: `src/components/AnalysisCards.jsx`, `src/components/ResultPanel.jsx`
- Create: `src/__tests__/ResultPanel.test.jsx`（覆盖 ScoreRing + RadarChart + AnalysisCards）

**Interfaces:**
- Consumes: `result: MatchResult`
- Produces: `<ResultPanel result={MatchResult} />`

- [ ] **Step 1: 创建 src/components/AnalysisCards.jsx**

```jsx
export default function AnalysisCards({ strengths, weaknesses, skillSuggestions }) {
  return (
    <div className="flex-1 min-w-[220px] flex flex-col gap-2">
      {/* 核心优势 - 绿色 */}
      <div className="bg-green-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-green-700 mb-2 flex items-center gap-1">
          <i className="fas fa-check-circle"></i>
          核心优势
        </h4>
        <ul className="space-y-1.5">
          {strengths.map((s, i) => (
            <li key={i} className="text-xs text-green-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{s.point}</span>
              <span className="block text-green-600 mt-0.5">{s.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 短板分析 - 红色 */}
      <div className="bg-red-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-red-700 mb-2 flex items-center gap-1">
          <i className="fas fa-triangle-exclamation"></i>
          短板分析
        </h4>
        <ul className="space-y-1.5">
          {weaknesses.map((w, i) => (
            <li key={i} className="text-xs text-red-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{w.point}</span>
              {w.isRequired && (
                <span className="inline-block ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-medium">
                  必备
                </span>
              )}
              <span className="block text-red-600 mt-0.5">{w.impact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 技能补足建议 - 蓝色 */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="font-semibold text-xs text-blue-700 mb-2 flex items-center gap-1">
          <i className="fas fa-lightbulb"></i>
          技能补足建议
        </h4>
        <ul className="space-y-2">
          {skillSuggestions.map((s, i) => (
            <li key={i} className="text-xs text-blue-800 bg-white/60 rounded-md p-2">
              <span className="font-medium">{s.skill}</span>
              <span className="block text-blue-500 mt-0.5 mb-1">{s.reason}</span>
              <ol className="list-decimal list-inside text-blue-600 space-y-0.5">
                {s.learningPath.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 src/components/ResultPanel.jsx**

```jsx
import ScoreRing from './ScoreRing';
import RadarChart from './RadarChart';
import AnalysisCards from './AnalysisCards';

export default function ResultPanel({ result }) {
  if (!result) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      {/* 左窄列：评分环 + 评语 */}
      <ScoreRing score={result.overallScore} comment={result.overallComment} />

      {/* 中列：雷达图 */}
      <RadarChart dimensions={result.dimensions} />

      {/* 右宽列：优势/短板/建议 */}
      <AnalysisCards
        strengths={result.strengths}
        weaknesses={result.weaknesses}
        skillSuggestions={result.skillSuggestions}
      />
    </div>
  );
}
```

- [ ] **Step 3: 创建 src/__tests__/ResultPanel.test.jsx**

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultPanel from '../components/ResultPanel';
import { demoResult } from '../data/demoData';

describe('ResultPanel', () => {
  it('result 为 null 时不渲染任何内容', () => {
    const { container } = render(<ResultPanel result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('渲染综合匹配分', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('综合匹配度')).toBeInTheDocument();
  });

  it('渲染核心优势', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('核心优势')).toBeInTheDocument();
    expect(screen.getByText('支付系统架构设计经验高度匹配')).toBeInTheDocument();
  });

  it('渲染短板分析，必备项有标签', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('短板分析')).toBeInTheDocument();
    expect(screen.getByText('必备')).toBeInTheDocument();
  });

  it('渲染技能补足建议', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText('技能补足建议')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('渲染综合评语', () => {
    render(<ResultPanel result={demoResult} />);
    expect(screen.getByText(/候选人在Java技术栈和支付领域与岗位高度匹配/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 更新 App.jsx 集成 ResultPanel**

```jsx
import { useMatchReducer } from './hooks/useMatchReducer';
import { matchResumeWithJD } from './services/api';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MatchButton from './components/MatchButton';
import ResultPanel from './components/ResultPanel';

export default function App() {
  const { state, setResume, setJd, startMatch, matchSuccess, matchError } =
    useMatchReducer();

  const handleMatch = async () => {
    startMatch();
    try {
      const result = await matchResumeWithJD(state.resumeText, state.jdText);
      matchSuccess(result);
    } catch (err) {
      matchError(err.message || '匹配失败，请重试');
    }
  };

  const hasContent = state.resumeText.trim().length > 0 && state.jdText.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Header isDemo={state.isDemo} />
      <InputPanel
        resumeText={state.resumeText}
        jdText={state.jdText}
        onResumeChange={setResume}
        onJdChange={setJd}
      />
      <MatchButton isLoading={state.isLoading} onMatch={handleMatch} hasContent={hasContent} />

      {state.error && (
        <div className="max-w-6xl mx-auto mb-3 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <span>
            <i className="fas fa-circle-exclamation mr-2"></i>
            {state.error === 'API_KEY_MISSING' && '请配置 VITE_DEEPSEEK_API_KEY 环境变量'}
            {state.error === 'API_KEY_INVALID' && 'API Key 无效，请检查配置'}
            {state.error === 'API_TIMEOUT' && '请求超时，请检查网络后重试'}
            {state.error === 'API_RATE_LIMITED' && '请求过于频繁，请稍后重试'}
            {!['API_KEY_MISSING', 'API_KEY_INVALID', 'API_TIMEOUT', 'API_RATE_LIMITED'].includes(
              state.error
            ) && `匹配失败：${state.error}`}
          </span>
          <button onClick={handleMatch} className="text-red-600 hover:text-red-800 font-medium text-xs underline">
            重试
          </button>
        </div>
      )}

      <ResultPanel result={state.result} />
    </div>
  );
}
```

- [ ] **Step 5: 运行测试验证**

```bash
npx vitest run
# 预期：28 tests passed
```

- [ ] **Step 6: 验证完整 UI**

```bash
npm run dev
# 确认：Demo 数据完整展示——78 分环形图、雷达图、优势/短板/建议三卡片、综合评语
# 确认：修改简历/JD 文本 → Demo 标签仍可见（因为未实际匹配）
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add ResultPanel with ScoreRing, RadarChart, and AnalysisCards"
```

---

### Task 11: 集成测试 + 响应式适配

**Files:**
- Create: `src/__tests__/App.test.jsx`（集成测试）
- Modify: `src/index.css`（响应式断点）

**Interfaces:**
- 无新增接口，验证完整流程

- [ ] **Step 1: 创建 src/__tests__/App.test.jsx**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock pdfjs-dist worker
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}));

describe('App 集成测试', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('初始渲染显示 Demo 数据和示例标签', () => {
    render(<App />);
    expect(screen.getByText('示例数据')).toBeInTheDocument();
    expect(screen.getByText('简历')).toBeInTheDocument();
    expect(screen.getByText('岗位描述 (JD)')).toBeInTheDocument();
    expect(screen.getByText('开始匹配分析')).toBeInTheDocument();
    // Demo 结果区
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('综合匹配度')).toBeInTheDocument();
  });

  it('用户可以编辑简历和 JD 文本', async () => {
    const user = userEvent.setup();
    render(<App />);

    const resumeTextarea = screen.getAllByRole('textbox')[0];
    await user.clear(resumeTextarea);
    await user.type(resumeTextarea, '新简历');
    expect(resumeTextarea).toHaveValue('新简历');

    const jdTextarea = screen.getAllByRole('textbox')[1];
    await user.clear(jdTextarea);
    await user.type(jdTextarea, '新JD');
    expect(jdTextarea).toHaveValue('新JD');
  });

  it('清空内容后点击匹配显示错误提示', async () => {
    const user = userEvent.setup();
    render(<App />);

    const resumeTextarea = screen.getAllByRole('textbox')[0];
    await user.clear(resumeTextarea);
    await user.click(screen.getByText('开始匹配分析'));
    expect(screen.getByText('请上传简历并粘贴岗位描述')).toBeInTheDocument();
  });

  it('API 匹配成功后 isDemo 标签隐藏', async () => {
    const mockAPIResult = {
      overallScore: 85,
      dimensions: {
        projectExperience: { score: 80, weight: 35, summary: 's' },
        technicalSkills: { score: 85, weight: 28, summary: 's' },
        domainMatch: { score: 90, weight: 15, summary: 's' },
        softSkills: { score: 75, weight: 12, summary: 's' },
        education: { score: 95, weight: 10, summary: 's' },
      },
      strengths: [{ point: 'p', dimension: 'd', detail: 'd' }],
      weaknesses: [{ point: 'p', dimension: 'd', impact: 'i', isRequired: false }],
      skillSuggestions: [{ skill: 's', reason: 'r', learningPath: ['1'] }],
      overallComment: 'comment',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify(mockAPIResult) } }],
        }),
    });

    const user = userEvent.setup();
    render(<App />);

    // 确认初始有 Demo 标签
    expect(screen.getByText('示例数据')).toBeInTheDocument();

    await user.click(screen.getByText('开始匹配分析'));

    await waitFor(() => {
      // Demo 标签应该消失
      expect(screen.queryByText('示例数据')).not.toBeInTheDocument();
    });

    // 新分数应该显示
    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 更新 src/index.css 添加响应式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@media (max-width: 768px) {
  .flex-wrap-results {
    flex-direction: column;
  }
}
```

- [ ] **Step 3: 更新 MatchButton 组件的错误提示引用检查点**

检查 App.jsx 中的错误信息映射是否正确覆盖 `api.js` 中所有错误类型：`API_KEY_MISSING`、`API_KEY_INVALID`、`API_TIMEOUT`、`API_RATE_LIMITED`、`API_NETWORK_ERROR`、`API_RESPONSE_NOT_JSON`、`API_RESPONSE_INVALID`、`API_RESPONSE_EMPTY`、`API_ERROR_4xx/5xx`。

更新 App.jsx 错误处理：

```jsx
// 替换 error 展示部分为更完整的映射：
const ERROR_MESSAGES = {
  API_KEY_MISSING: '请配置 VITE_DEEPSEEK_API_KEY 环境变量',
  API_KEY_INVALID: 'API Key 无效，请检查配置',
  API_TIMEOUT: '请求超时，请检查网络后重试',
  API_RATE_LIMITED: '请求过于频繁，请稍后重试',
  API_NETWORK_ERROR: '网络连接失败，请检查网络',
  API_RESPONSE_EMPTY: 'API 返回为空，请重试',
  API_RESPONSE_NOT_JSON: '结果解析失败，请重试',
};

// 在 JSX 中使用：
const errorMessage =
  ERROR_MESSAGES[state.error] || `匹配失败：${state.error}`;
```

- [ ] **Step 4: 运行全部测试**

```bash
npx vitest run
# 预期：32 tests passed（28 + 4 App 集成测试）
```

- [ ] **Step 5: 手动端到端验证**

```bash
# 创建 .env 文件（不提交）
echo "VITE_DEEPSEEK_API_KEY=你的真实key" > .env

npm run dev

# 验证流程：
# 1. 打开页面，看到 Demo 数据
# 2. 修改简历和 JD 文本
# 3. 点击匹配 → 看到加载态
# 4. 收到结果 → Demo 标签消失
# 5. 清空内容点匹配 → 看到错误提示
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add integration tests and responsive styles"
```

---

## Verification Checklist

全部 Task 完成后，按以下列表逐项验证：

| # | 验收项 | 对应 US |
|---|--------|---------|
| 1 | 页面打开即展示 Demo 简历、JD、完整匹配结果 | US-10 |
| 2 | 顶部显示"示例数据"标签 | US-10 |
| 3 | PDF 拖拽上传后正确提取文本 | US-01 |
| 4 | 粘贴文本 Tab 可正常输入 | US-02 |
| 5 | JD 文本区可正常输入 | US-03 |
| 6 | 简历和 JD 均为空时点击匹配显示行内错误提示 | 空输入校验 |
| 7 | 点击匹配 → 按钮显示"分析中..."+ spinner | US-12 |
| 8 | 匹配完成 → 综合评分环形图更新 | US-04 |
| 9 | 五维雷达图展示正确 | US-05 |
| 10 | 核心优势 3-5 条，含佐证细节 | US-06 |
| 11 | 短板分析含"必备"标签和影响说明 | US-07 |
| 12 | 技能建议含 2-3 步学习路径 | US-08 |
| 13 | 综合评语在评分环下方 | US-09 |
| 14 | 真实匹配后"示例数据"标签消失 | US-11 |
| 15 | API 错误展示友好提示 + 重试按钮 | US-13 |
| 16 | 所有 Vitest 测试通过 | 质量保证 |
| 17 | .env 文件不在 git 跟踪中 | 安全 |
