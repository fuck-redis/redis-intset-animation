# 组件使用指南

本文档介绍项目中新增的专业组件及其使用方法。

---

## 📦 新增组件

### 1. CodeBlock - 代码高亮组件

专业的代码展示组件，支持语法高亮、复制功能、行号显示等特性。

#### 特性

- ✅ **VS Code Dark Plus主题** - 专业的深色代码主题
- ✅ **语法高亮** - 支持20+编程语言
- ✅ **一键复制** - 点击复制按钮快速复制代码
- ✅ **行号显示** - 可选的行号显示功能
- ✅ **标题栏** - 可选的代码块标题
- ✅ **响应式** - 自适应不同屏幕尺寸

#### 基础用法

```tsx
import CodeBlock from '@/components/CodeBlock/CodeBlock';

function MyComponent() {
  return (
    <CodeBlock 
      code={`SADD myset 1 2 3
SMEMBERS myset`}
      language="bash"
    />
  );
}
```

#### 完整参数

```tsx
<CodeBlock 
  code={`typedef struct intset {
    uint32_t encoding;
    uint32_t length;
    int8_t contents[];
} intset;`}
  language="c"              // 编程语言
  title="C语言结构定义"      // 标题（可选）
  showLineNumbers           // 显示行号（可选）
/>
```

#### 支持的语言

| 语言 | language值 | 说明 |
|------|-----------|------|
| Bash/Shell | `bash` | Redis命令、Shell脚本 |
| C/C++ | `c` 或 `cpp` | C语言代码 |
| JavaScript | `javascript` 或 `js` | JS代码 |
| TypeScript | `typescript` 或 `ts` | TS代码 |
| Python | `python` | Python代码 |
| JSON | `json` | JSON数据 |
| Markdown | `markdown` | Markdown文本 |

#### 示例场景

**1. Redis命令示例**
```tsx
<CodeBlock 
  code={`127.0.0.1:6379> SADD numbers 1 2 3
(integer) 3
127.0.0.1:6379> OBJECT ENCODING numbers
"intset"`}
  language="bash"
  title="查看底层编码"
/>
```

**2. C语言代码**
```tsx
<CodeBlock 
  code={`// 查找元素
int intsetFind(intset *is, int64_t value) {
    uint32_t pos;
    if (intsetSearch(is, value, &pos)) {
        return 1;
    }
    return 0;
}`}
  language="c"
  showLineNumbers
  title="intsetFind函数"
/>
```

**3. 配置文件**
```tsx
<CodeBlock 
  code={`# redis.conf
set-max-intset-entries 512
maxmemory 256mb`}
  language="bash"
  title="redis.conf"
/>
```

---

### 2. Alert - 信息提示组件

美观的信息提示框组件，支持多种类型和自定义标题。

#### 特性

- ✅ **4种类型** - info / warning / success / tip
- ✅ **图标支持** - 每种类型都有对应的Lucide图标
- ✅ **渐变背景** - 美观的渐变色背景
- ✅ **左侧边框** - 彩色边框突出重点
- ✅ **hover效果** - 上浮和阴影效果
- ✅ **支持嵌套** - 可包含代码、链接等

#### 基础用法

```tsx
import Alert from '@/components/Alert/Alert';

function MyComponent() {
  return (
    <Alert type="info">
      这是一条普通信息提示
    </Alert>
  );
}
```

#### 4种类型

**1. Info - 信息提示（蓝色）**
```tsx
<Alert type="info" title="信息">
  IntSet使用<strong>二分查找</strong>算法，
  时间复杂度为O(log n)。
</Alert>
```

**2. Warning - 警告提示（黄色）**
```tsx
<Alert type="warning" title="注意">
  删除操作不会触发编码降级，
  即使删除后所有元素都在小范围内。
</Alert>
```

**3. Success - 成功提示（绿色）**
```tsx
<Alert type="success" title="完成">
  所有测试用例通过！代码质量优秀。
</Alert>
```

**4. Tip - 技巧提示（紫色）**
```tsx
<Alert type="tip" title="核心思想">
  IntSet通过<strong>动态编码</strong>和
  <strong>有序存储</strong>实现内存和性能的平衡。
</Alert>
```

#### 带代码的Alert

```tsx
<Alert type="warning" title="编码不可降级">
  <p>
    即使删除了导致升级的大值元素，
    编码也不会降级回原来的类型。
  </p>
  <CodeBlock 
    code={`SADD myset 1 2 3      # INT16
SADD myset 100000     # 升级到INT32
SREM myset 100000     # 删除
OBJECT ENCODING myset # 仍是INT32`}
    language="bash"
  />
</Alert>
```

#### 完整参数

```tsx
interface AlertProps {
  type?: 'info' | 'warning' | 'success' | 'tip';  // 默认 'info'
  title?: string;                                  // 标题（可选）
  children: React.ReactNode;                       // 内容
}
```

#### 样式定制

Alert组件使用CSS变量，可以通过修改变量自定义颜色：

```css
/* 自定义info颜色 */
.alert-info {
  --alert-bg: #dbeafe;
  --alert-border: #3b82f6;
  --alert-text: #1e40af;
}
```

---

## 🎨 样式规范

### 主题颜色

```css
/* 主色调 */
--primary: #667eea;
--primary-dark: #764ba2;

/* 语义颜色 */
--info: #3b82f6;
--warning: #f59e0b;
--success: #10b981;
--tip: #a855f7;
```

### 字体规范

```css
/* 代码字体 */
--font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;

/* 正文字体 */
--font-sans: system-ui, -apple-system, sans-serif;
```

---

## 📝 最佳实践

### 1. 代码块

**✅ 推荐：指定语言**
```tsx
<CodeBlock code="..." language="bash" />
```

**❌ 不推荐：不指定语言**
```tsx
<CodeBlock code="..." />  // 默认bash，但最好明确指定
```

**✅ 推荐：添加标题**
```tsx
<CodeBlock 
  code="..." 
  language="c"
  title="intset.c - intsetAdd函数"  // 明确说明代码来源
/>
```

**✅ 推荐：复杂代码显示行号**
```tsx
<CodeBlock 
  code={longCode}
  language="c"
  showLineNumbers  // 方便引用特定行
/>
```

### 2. Alert组件

**✅ 推荐：选择合适的类型**
```tsx
// 重要警告用warning
<Alert type="warning" title="注意">...</Alert>

// 技巧和建议用tip
<Alert type="tip" title="优化建议">...</Alert>

// 成功结果用success
<Alert type="success" title="测试通过">...</Alert>
```

**✅ 推荐：使用描述性标题**
```tsx
<Alert type="warning" title="编码不可降级">...</Alert>
// 而不是
<Alert type="warning" title="注意">...</Alert>
```

**✅ 推荐：Alert内包含代码示例**
```tsx
<Alert type="tip" title="使用示例">
  <p>可以这样使用：</p>
  <CodeBlock code="..." language="bash" />
</Alert>
```

### 3. 组合使用

```tsx
// 先讲解概念
<h3>二分查找算法</h3>
<p>IntSet使用二分查找算法定位元素...</p>

// 再展示代码
<CodeBlock 
  code={binarySearchCode}
  language="python"
  title="二分查找伪代码"
  showLineNumbers
/>

// 最后提示要点
<Alert type="tip" title="时间复杂度">
  对于100个元素，最多比较7次；
  对于1000个元素，最多比较10次。
</Alert>
```

---

## 🔧 故障排除

### 代码高亮不显示

**问题：** 代码没有语法高亮

**解决：**
1. 检查是否正确导入组件
2. 确认`language`参数是否正确
3. 确认`react-syntax-highlighter`是否安装

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### 复制按钮无反应

**问题：** 点击复制按钮没有反应

**解决：**
1. 检查浏览器是否支持`navigator.clipboard`
2. 确认页面是否在HTTPS或localhost下运行
3. 检查浏览器控制台错误信息

### Alert样式异常

**问题：** Alert组件显示不正常

**解决：**
1. 确认CSS文件已正确导入
2. 检查是否有其他CSS覆盖了样式
3. 确认`type`参数值是否正确（info/warning/success/tip）

---

## 📚 相关资源

### 官方文档

- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [Lucide React](https://lucide.dev/)
- [Prism语言支持](https://prismjs.com/#supported-languages)

### 主题定制

- [VS Code主题](https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_PRISM.MD)

---

## 🎯 示例项目

完整的使用示例可以参考：

- `src/pages/TutorialPage/TutorialPage.tsx` - 教程页完整实现
- `src/components/CodeBlock/CodeBlock.tsx` - 组件源码
- `src/components/Alert/Alert.tsx` - 组件源码

---

## 💡 贡献

如果你发现组件有bug或有改进建议，欢迎：

1. 提交Issue
2. 创建Pull Request
3. 在讨论区分享你的想法

---

**文档更新时间：** 2024-11-18  
**组件版本：** 1.0.0  
**维护者：** Redis IntSet 可视化团队
