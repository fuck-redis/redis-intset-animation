import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Video, Zap, Database, Clock, MemoryStick, ArrowRight, CheckCircle, Layers, Search, Plus, Trash2, Shield, Activity, Target, TrendingUp } from 'lucide-react';
import { LearningScenario } from '../../types/intset';
import { VideoModal, type VideoConfig } from '../../components/VideoModal/VideoModal';
import VideoEmbed from '../../components/VideoEmbed';
import {
  BinarySearchVideo,
  EncodingUpgradeVideo,
  InsertOperationVideo,
  DeleteOperationVideo,
} from '../../videos';
import './ScenariosPage.css';

const SCENARIO_VIDEOS: Record<string, VideoConfig> = {
  '基础操作演示': {
    id: 'scenario-basic',
    title: '插入与查找操作',
    description: '演示基本的插入和查找操作',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 25, initialData: [10, 20, 30] },
  },
  '编码升级 - INT16到INT32': {
    id: 'scenario-upgrade-int16',
    title: '编码升级 INT16→INT32',
    description: '插入超出INT16范围的值，触发升级',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 40000 },
  },
  '编码升级 - 负数溢出': {
    id: 'scenario-upgrade-negative',
    title: '编码升级 负数溢出',
    description: '插入负数触发编码升级',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: -40000 },
  },
  '批量插入场景': {
    id: 'scenario-batch',
    title: '批量插入',
    description: '一次性插入多个元素的演示',
    component: InsertOperationVideo,
    props: { operation: 'insert', value: 35, initialData: [5, 15, 25] },
  },
  '二分查找演示': {
    id: 'scenario-binary-search',
    title: '二分查找算法',
    description: '在大型集合中查找元素',
    component: BinarySearchVideo,
    props: { searchValue: 70, data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  },
  '删除操作演示': {
    id: 'scenario-delete',
    title: '删除操作',
    description: '删除元素并观察内存变化',
    component: DeleteOperationVideo,
    props: { operation: 'delete', value: 15, initialData: [5, 10, 15, 20, 25] },
  },
  '连续升级场景': {
    id: 'scenario-continuous-upgrade',
    title: '连续编码升级',
    description: '体验完整的编码升级链 INT16→INT32→INT64',
    component: EncodingUpgradeVideo,
    props: { initialEncoding: 'INT16', triggerValue: 10000000000 },
  },
};

// Detailed scenario data with educational content
interface ExtendedScenario extends LearningScenario {
  difficulty: '入门' | '进阶' | '高级';
  category: '基础操作' | '编码升级' | '性能优化' | '实际应用';
  learningGoals: string[];
  whyMatters: string;
  howItWorks: string[];
  redisCommands: string[];
  timeComplexity: string;
  spaceComplexity: string;
  memoryLayout?: string;
  realWorldUseCase: string;
  keyTakeaway: string;
  commonPitfalls?: string[];
  performanceTips?: string[];
}

// Scenario categories for better organization
const SCENARIO_CATEGORIES = [
  { id: 'basics', name: '基础操作', icon: <Layers size={16} />, description: '理解 IntSet 的核心操作' },
  { id: 'encoding', name: '编码升级', icon: <TrendingUp size={16} />, description: '掌握内存优化的关键机制' },
  { id: 'performance', name: '性能优化', icon: <Activity size={16} />, description: '高效使用 IntSet 的技巧' },
  { id: 'realworld', name: '实际应用', icon: <Target size={16} />, description: '真实场景中的具体应用' },
];

const EXTENDED_SCENARIOS: ExtendedScenario[] = [
  // ==================== 基础操作 ====================
  {
    name: '基础操作演示',
    description: '掌握 IntSet 的插入与查找操作，理解其有序性如何实现',
    initialSet: [10, 20, 30],
    operations: [
      { type: 'insert', params: { value: 25 } },
      { type: 'search', params: { value: 25 } },
    ],
    expectedResult: '[10, 20, 25, 30] - INT16编码',
    difficulty: '入门',
    category: '基础操作',
    learningGoals: [
      '理解 IntSet 如何保持元素有序（不是插入顺序，而是数值顺序）',
      '观察插入时的二分查找定位和元素右移动作',
      '体验 SISMEMBER 的 O(log n) 查找效率',
      '理解 contents 数组如何连续存储元素',
    ],
    whyMatters: 'IntSet 的有序性是 Redis 提供有序集合功能的基础。与普通数组不同，IntSet 保证元素始终按数值大小排列，这使得二分查找成为可能。理解插入和查找操作是掌握 IntSet 一切特性的前提。',
    howItWorks: [
      '插入时，首先通过二分查找找到正确的位置（维持有序）',
      '将大于插入值的元素向右移动一位（腾出空间）',
      '将新值放入空出的位置',
      '更新 header 中的 length 字段',
      '查找时，同样使用二分查找定位元素（O(log n)）',
    ],
    redisCommands: [
      'SADD myset 10 20 30    // 创建集合并添加元素',
      'SADD myset 25          // 插入新元素（自动维持有序）',
      'SISMEMBER myset 25     // 查找元素，返回 1（存在）',
      'SISMEMBER myset 15     // 返回 0（不存在）',
      'SMEMBERS myset         // 查看所有元素：[10, 20, 25, 30]',
    ],
    timeComplexity: 'O(log n) 查找, O(n) 插入',
    spaceComplexity: 'O(n) - n 为元素数量',
    realWorldUseCase: '存储用户 ID、订单 ID 等整数类型的唯一标识',
    keyTakeaway: 'IntSet 的有序性是理解后续所有特性的基础。插入 O(n) 但查找 O(log n) 是典型的有序数组特性。',
    commonPitfalls: [
      '误以为 IntSet 按插入顺序排列（实际按数值排序）',
      '忽视插入操作的 O(n) 复杂度，大数据量时性能下降',
    ],
    performanceTips: [
      '批量插入比多次单值插入更高效',
      '避免频繁的小量插入操作',
    ],
    memoryLayout: `
┌─────────────────────────────────────────────────────────────┐
│  IntSet 内存结构                                             │
├─────────────────────────────────────────────────────────────┤
│  Header:                                                    │
│  ┌──────────┬──────────┬──────────┐                        │
│  │ encoding │  length  │  <data>  │                        │
│  │  INT16   │    4     │          │                        │
│  └──────────┴──────────┴──────────┘                        │
│       ↓                                                     │
│  contents[] 数组（连续内存）:                                │
│  ┌────────┬────────┬────────┬────────┐                    │
│  │  [10]  │  [20]  │  [25]  │  [30]  │                    │
│  │  2B    │   2B   │   2B   │   2B   │                    │
│  └────────┴────────┴────────┴────────┘                    │
│    索引 0     索引 1    索引 2     索引 3                   │
│                                                             │
│  总内存: 10 字节 (header) + 8 字节 (data) = 18 字节          │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: '批量插入场景',
    description: '学习如何高效地向 IntSet 添加多个元素',
    initialSet: [],
    operations: [
      { type: 'batchInsert', params: { values: [5, 15, 25, 35, 45] } },
    ],
    expectedResult: '快速构建有序集合',
    difficulty: '入门',
    category: '基础操作',
    learningGoals: [
      '理解 Redis SADD 命令原生支持批量添加',
      '观察批量插入如何一次性完成排序和插入',
      '了解批量操作如何减少网络往返',
    ],
    whyMatters: '批量操作是生产环境中最常用的模式。相比逐个插入，批量操作能将多次网络往返合并为一次，显著提升性能。Redis 的 SADD 命令本身就设计为支持多值添加，这是最高效的初始化方式。',
    howItWorks: [
      'Redis 接收批量插入请求：SADD myset 5 15 25 35 45',
      '对所有值进行排序（确定最终位置）',
      '检查是否需要编码升级（基于最大值）',
      '一次性分配足够的连续内存',
      '将所有元素复制到 contents 数组',
      '更新 length 字段',
    ],
    redisCommands: [
      'SADD myset 5 15 25 35 45     // 一次性添加5个元素',
      'SMEMBERS myset               // 查看: [5, 15, 25, 35, 45]（已排序）',
      'SCARD myset                  // 返回: 5',
      'SADD myset 10 20 30          // 继续添加更多元素',
    ],
    timeComplexity: 'O(k log k) 其中 k 为插入元素数量',
    spaceComplexity: 'O(k) 新增空间',
    realWorldUseCase: '初始化用户标签系统，一次性添加用户的全部兴趣标签；批量导入商品 ID 列表',
    keyTakeaway: '总是优先使用批量插入而非循环单值插入，可减少网络往返并让 Redis 一次性优化。',
    commonPitfalls: [
      '在代码中循环调用 SADD 单个添加（应使用批量）',
      '未考虑批量插入时的排序开销',
    ],
    performanceTips: [
      '单次 SADD 添加越多元素越好（一次不超过几千个）',
      '避免高频小批量操作，可适当缓冲后批量提交',
    ],
    memoryLayout: `
批量插入后的内存布局:
┌─────────────────────────────────────────────────────────────┐
│  批量插入示例                                                 │
├─────────────────────────────────────────────────────────────┤
│  输入: SADD myset 5 15 25 35 45                             │
│                                                             │
│  排序后插入顺序: [5, 15, 25, 35, 45]                         │
│                                                             │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │ encoding │          contents[]                         │  │
│  │  INT16   │  [5]   [15]  [25]  [35]  [45]              │  │
│  │ length:5 │  2B     2B    2B    2B    2B               │  │
│  └──────────┴────────────────────────────────────────────┘  │
│                  共 10B 数据 + 10B header = 20B             │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: '删除操作演示',
    description: '理解删除操作的实现细节及对性能的影响',
    initialSet: [5, 10, 15, 20, 25],
    operations: [
      { type: 'delete', params: { value: 15 } },
      { type: 'delete', params: { value: 5 } },
    ],
    expectedResult: '元素移动，内存不收缩',
    difficulty: '进阶',
    category: '基础操作',
    learningGoals: [
      '理解删除操作需要移动元素（O(n) 复杂度）',
      '观察元素左移填补空缺的过程',
      '认识内存不会自动收缩的特性',
      '理解为什么频繁删除会降低效率',
    ],
    whyMatters: '删除操作需要移动删除位置之后的所有元素，这是 IntSet 的主要性能弱点。了解这一点有助于在系统设计时避免频繁删除操作，或者选择更合适的数据结构。',
    howItWorks: [
      '使用二分查找定位要删除的元素（O(log n)）',
      '找到后，将该位置之后的所有元素向左移动一位',
      '更新 length 字段（减 1）',
      '注意：内存不会自动收缩！',
      '删除是 IntSet 最慢的操作，尽量避免',
    ],
    redisCommands: [
      'SADD nums 5 10 15 20 25',
      'SREM nums 15             // 删除元素 15',
      'SMEMBERS nums           // 查看: [5, 10, 20, 25]',
      'SCARD nums              // 返回: 4',
      '// 注意：内存占用不变，仍是 10B',
    ],
    timeComplexity: 'O(n) - 需要移动后续所有元素',
    spaceComplexity: 'O(1) - 不释放内存',
    realWorldUseCase: '用户退订功能，删除已取消的订单 ID；移除过期的活动参与记录',
    keyTakeaway: '删除是 IntSet 的性能瓶颈。如果需要频繁删除，考虑使用 Hash 或 Sorted Set 结构。',
    commonPitfalls: [
      '误以为删除会释放内存（实际上不会）',
      '在高频删除场景中使用 IntSet',
    ],
    performanceTips: [
      '如果需要频繁删除，可考虑重建整个集合',
      '删除后如果集合变小，可使用 SINTERSTORE 重建以释放内存',
    ],
    memoryLayout: `
删除 15 前的内存:
┌─────────────────────────────────────────────────────────────┐
│  contents[]  │ [5]   [10]  [15]  [20]  [25]                  │
│  length: 5   │  2B     2B     2B     2B     2B               │
└─────────────────────────────────────────────────────────────┘

删除 15 后:
┌─────────────────────────────────────────────────────────────┐
│  contents[]  │ [5]   [10]  [20]  [25]  [??]  ← 残留数据      │
│  length: 4   │  2B     2B     2B     2B                       │
│              │      ←── 元素左移 ──→                          │
│  内存占用不变！仍是 10B 数据区                                │
└─────────────────────────────────────────────────────────────┘

正确做法：重建集合以释放内存
┌─────────────────────────────────────────────────────────────┐
│  SINTERSTORE temp myset   // 复制到临时集合（内存优化）       │
│  DEL myset                // 删除原集合                       │
│  RENAME temp myset        // 重命名回来                       │
└─────────────────────────────────────────────────────────────┘
    `,
  },

  // ==================== 编码升级 ====================
  {
    name: '编码升级 - INT16到INT32',
    description: '深入理解 IntSet 编码升级的触发条件和内存变化',
    initialSet: [100, 1000, 10000],
    operations: [
      { type: 'insert', params: { value: 40000 } },
    ],
    expectedResult: '升级到 INT32，内存从 6 字节增至 16 字节',
    difficulty: '进阶',
    category: '编码升级',
    learningGoals: [
      '理解编码升级的触发条件（插入值超出当前编码范围）',
      '观察内存重新分配和数据迁移的完整过程',
      '计算编码升级带来的内存开销增长',
      '理解为什么升级是 O(n) 操作',
    ],
    whyMatters: '编码升级是 IntSet 最重要的优化机制。当元素值超出当前编码范围时，Redis 会自动升级编码以容纳更大的值。这个过程对用户透明，但了解它有助于预测内存使用和优化数据结构选择。',
    howItWorks: [
      '检测到插入值 40000 超出 INT16 范围（-32768 ~ 32767）',
      '分配新的 INT32 编码的内存空间（4 倍于 INT16 大小）',
      '将所有现有元素转换为 INT32 格式（重新编码）',
      '将新元素添加到正确位置（维持有序）',
      '释放旧的 INT16 内存',
      '更新 encoding 字段为 INT32',
    ],
    redisCommands: [
      'SADD myset 100 1000 10000    // INT16 编码，共 6B',
      'SADD myset 40000             // 触发升级到 INT32',
      'DEBUG OBJECT ENCODING myset  // 查看编码: "intset"→"int32"',
      'MEMORY USAGE myset          // 查看内存占用变化',
    ],
    timeComplexity: 'O(n) - 需要重新分配和复制所有元素',
    spaceComplexity: 'INT16: 6B → INT32: 16B（增长 167%）',
    realWorldUseCase: '用户粉丝数达到 32768 时，存储用户粉丝集合需要升级编码',
    keyTakeaway: '编码升级涉及重新分配内存和复制所有数据，是昂贵的操作。预估数据范围可避免频繁升级。',
    commonPitfalls: [
      '未预估数据范围导致频繁升级（每次升级都 O(n)）',
      '误以为升级是可逆的（实际上不可逆）',
    ],
    performanceTips: [
      '批量插入时 Redis 会根据最大值预判是否需要升级',
      '如果数据确定会升级，可提前使用更高编码初始化',
    ],
    memoryLayout: `
升级前 (INT16 - 2B/元素):
┌─────────────────────────────────────────────────────────────┐
│  encoding: INT16                                            │
│  length: 3                                                  │
│  ┌────────┬────────┬────────┐                             │
│  │  100   │  1000  │ 10000  │                             │
│  │  2B    │   2B   │   2B   │                             │
│  └────────┴────────┴────────┘                             │
│  数据区: 6B | 总计: 6B + 10B header = 16B                  │
└─────────────────────────────────────────────────────────────┘

                          ↓ 插入 40000

升级后 (INT32 - 4B/元素):
┌─────────────────────────────────────────────────────────────┐
│  encoding: INT32                                            │
│  length: 4                                                  │
│  ┌────────┬─────────┬─────────┬─────────┐                 │
│  │  100   │  1000   │  10000  │  40000  │                 │
│  │  4B    │   4B    │   4B    │   4B    │                 │
│  └────────┴─────────┴─────────┴─────────┘                 │
│  数据区: 16B | 总计: 16B + 10B header = 26B                 │
└─────────────────────────────────────────────────────────────┘

内存增长: 16B → 26B (+62.5%)
    `,
  },
  {
    name: '编码升级 - 负数溢出',
    description: '理解负数在 IntSet 中的处理和对称的编码范围',
    initialSet: [-100, -1000, -10000],
    operations: [
      { type: 'insert', params: { value: -40000 } },
    ],
    expectedResult: 'INT16 → INT32，支持更大范围负数',
    difficulty: '进阶',
    category: '编码升级',
    learningGoals: [
      '理解 IntSet 使用有符号整数，编码范围对称',
      '观察负数在内存中的二进制补码存储方式',
      '理解负数升级与正数升级的对称性',
    ],
    whyMatters: 'IntSet 使用有符号整数，编码范围是对称的（INT16: -32768 ~ 32767）。理解负数处理对于处理温度、经纬度、高度变化、债务等正负值混合场景很重要。',
    howItWorks: [
      'INT16 范围: -32768 ~ 32767（对称）',
      '当插入 -40000 时，超出 INT16 下界',
      '触发从 INT16 到 INT32 的升级',
      'INT32 范围: -2147483648 ~ 2147483647',
      '负数在内存中以二进制补码形式存储',
      '补码特性：负数的绝对值越大，编码值越小',
    ],
    redisCommands: [
      'SADD temps -100 -1000 -10000   // 存储温度记录（华氏温度）',
      'SADD temps -40000              // 极端低温，触发升级',
      'SISMEMBER temps -40000         // 返回 1',
      'DEBUG OBJECT ENCODING temps    // "int32"',
    ],
    timeComplexity: 'O(n) 升级操作',
    spaceComplexity: '从 6B 增长到 16B',
    realWorldUseCase: '记录历史温度数据（包含液氮温度 -196°C、液氦温度 -269°C 等极端负值）；存储地理海拔变化（含海底深度）',
    keyTakeaway: '负数处理与正数完全对称，补码存储使得比较操作统一处理。设计系统时要考虑正负值混合的场景。',
    commonPitfalls: [
      '忽略负数范围导致意外升级',
      '误以为负数存储空间更大（实际相同）',
    ],
    performanceTips: [
      '如果数据主要是负数，可考虑统一加偏移量转为正数',
      '混合正负数时按绝对值最大者决定编码',
    ],
    memoryLayout: `
负数存储示例 (INT32 编码):
┌─────────────────────────────────────────────────────────────┐
│  十进制值    │  二进制补码（十六进制）  │  说明              │
├──────────────┼────────────────────────┼────────────────────┤
│     -1       │  FF FF FF FF            │  全 1             │
│   -100       │  FF FF FF 9C            │                   │
│  -1000       │  FF FF FC 18            │                   │
│ -10000       │  FF FF D8 F0            │                   │
│ -40000       │  FF FF 60 80            │  触发升级的值      │
└──────────────┴────────────────────────┴────────────────────┘

注意：负数的补码表示中，绝对值越大，数值越小（更负）
-40000 < -10000 < -1000 < -100 < -1
    `,
  },
  {
    name: '连续升级场景',
    description: '体验完整的编码升级链路，理解升级的不可逆性',
    initialSet: [100],
    operations: [
      { type: 'insert', params: { value: 100000 } },
      { type: 'insert', params: { value: 10000000000 } },
    ],
    expectedResult: 'INT16 → INT32 → INT64（不可逆）',
    difficulty: '高级',
    category: '编码升级',
    learningGoals: [
      '体验完整的编码升级链 INT16 → INT32 → INT64',
      '观察每次升级的触发条件和内存变化',
      '深刻理解编码升级的不可逆性及其影响',
    ],
    whyMatters: '编码升级是单向的！一旦升级到更大的编码，即使删除所有大值，也无法回退到更小的编码。这对内存敏感型应用有重要影响。如果你的数据先小后大然后又小，内存会一直保持升级后的水平。',
    howItWorks: [
      '初始状态：100 在 INT16 范围内 (100 ∈ [-32768, 32767])',
      '插入 100000：超出 INT16，触发 INT16→INT32 升级',
      '100000 在 INT32 范围内 (100000 ∈ [-2147483648, 2147483647])',
      '插入 10000000000：超出 INT32，触发 INT32→INT64 升级',
      'INT64 范围: -9223372036854775808 ~ 9223372036854775807',
      '升级链：INT16 → INT32 → INT64（单向，不可逆）',
    ],
    redisCommands: [
      'SADD bigset 100                    // INT16',
      'SADD bigset 100000                 // INT32',
      'SADD bigset 10000000000            // INT64',
      'DEBUG OBJECT ENCODING bigset       // "int64"',
      'SREM bigset 10000000000           // 删除大值后仍是 INT64!',
      'SREM bigset 100000                // 删除中值后仍是 INT64!',
      'SREM bigset 100                   // 删除所有值，仍是 INT64!',
    ],
    timeComplexity: 'O(n) 每次升级',
    spaceComplexity: '2B → 4B → 8B 每元素',
    realWorldUseCase: '处理用户 ID 超过 20 亿（INT32 上限）时的系统迁移；跟踪超过 INT64 范围的极端场景（科学计算）',
    keyTakeaway: '编码升级不可逆。设计时要预估数据范围，避免不必要的大编码。如果内存紧张，删除所有元素后重建是唯一解决办法。',
    commonPitfalls: [
      '假设删除大值后编码会回退（错误）',
      '未预估峰值导致永久高内存占用',
    ],
    performanceTips: [
      '使用 DEBUG OBJECT ENCODING 监控编码状态',
      '对于波动数据，定期重建集合以优化内存',
    ],
    memoryLayout: `
编码升级链路示意:

┌─────────────────────────────────────────────────────────────┐
│  INT16 (2B/元素)                                             │
│  范围: -32,768 ~ 32,767                                      │
│  适用: 大部分用户 ID、订单 ID、物品 ID                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ 插入 100,000
┌─────────────────────────────────────────────────────────────┐
│  INT32 (4B/元素)                                             │
│  范围: -2,147,483,648 ~ 2,147,483,647                        │
│  适用: 较大 ID、时间戳（Unix 秒）                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ 插入 10,000,000,000
┌─────────────────────────────────────────────────────────────┐
│  INT64 (8B/元素)                                             │
│  范围: -9,223,372,036,854,775,808 ~ 9,223,372,036...        │
│  适用: 毫秒时间戳、大数值                                      │
└─────────────────────────────────────────────────────────────┘

升级判断规则：
- 新值超出当前编码范围 → 升级到下一级
- 范围检查包括正负两个方向
    `,
  },

  // ==================== 性能优化 ====================
  {
    name: '二分查找演示',
    description: '深入理解 O(log n) 查找效率的原理和实际应用',
    initialSet: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    operations: [
      { type: 'search', params: { value: 70 } },
      { type: 'search', params: { value: 25 } },
    ],
    expectedResult: '演示 O(log n) 查找效率',
    difficulty: '进阶',
    category: '性能优化',
    learningGoals: [
      '深入理解二分查找算法的执行过程',
      '观察成功查找和失败查找的对比',
      '计算不同数据规模下的比较次数',
      '理解 O(log n) 如何实现高效查找',
    ],
    whyMatters: '二分查找是 IntSet 高效查询的核心。O(log n) 的时间复杂度意味着即使集合有百万元素，也只需约 20 次比较就能完成定位。这是 IntSet 相比普通 Hash 集合的独特优势——在保持 O(1) 插入的同时实现了高效查找。',
    howItWorks: [
      '维护左右边界指针（left=0, right=n-1）',
      '计算中间位置 mid = (left + right) / 2',
      '比较 contents[mid] 与目标值',
      '如果相等，查找成功，返回位置',
      '如果目标更大（contents[mid] < target），舍弃左半部分（left = mid + 1）',
      '如果目标更小（contents[mid] > target），舍弃右半部分（right = mid - 1）',
      '重复直到找到或 left > right（未找到）',
    ],
    redisCommands: [
      'SADD sorted 10 20 30 40 50 60 70 80 90 100',
      'SISMEMBER sorted 70    // 命中: 1（约 4 次比较）',
      'SISMEMBER sorted 25    // 未命中: 0（约 4 次比较）',
      '// 百万元素仅需约 20 次比较',
    ],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    realWorldUseCase: '快速检查用户是否已签到（每天一条签到记录）；验证优惠券码是否存在；检查商品 ID 是否在促销列表中',
    keyTakeaway: '二分查找是 IntSet 高效性的核心。O(log n) 意味着 100 万元素只需约 20 次比较，而非线性查找的 100 万次。',
    commonPitfalls: [
      '将 IntSet 的有序性与 Sorted Set 混淆',
      '忽略 IntSet 只存储整数的限制',
    ],
    performanceTips: [
      'IntSet 查找比 Sorted Set 的 ZSCAN 快得多',
      '对于静态整数集合，IntSet 是最优选择',
    ],
    memoryLayout: `
二分查找过程 (查找 70):
┌─────────────────────────────────────────────────────────────┐
│  步骤 1: [10] [20] [30] [40] [50] [60] [70] [80] [90] [100] │
│           L                                           R     │
│           └────────────────── M ──────────────────┘         │
│                        mid=4, contents[4]=50 < 70          │
│                        更新 L = mid + 1                    │
├─────────────────────────────────────────────────────────────┤
│  步骤 2:              [60] [70] [80] [90] [100]            │
│                       L                                     │
│                              M                              │
│                        mid=7, contents[7]=80 > 70          │
│                        更新 R = mid - 1                    │
├─────────────────────────────────────────────────────────────┤
│  步骤 3:              [60] [70] [80]                        │
│                       L                                     │
│                       L     M                               │
│                        mid=5, contents[5]=60 < 70          │
│                        更新 L = mid + 1                    │
├─────────────────────────────────────────────────────────────┤
│  步骤 4:                    [70] [80]                        │
│                              L                              │
│                              M  ←  找到!                    │
│                        contents[6]=70 == 70                │
└─────────────────────────────────────────────────────────────┘

性能分析:
- 10 个元素: log₂(10) ≈ 3.3 → 最多 4 次比较
- 100 万元素: log₂(1000000) ≈ 19.9 → 最多 20 次比较
- 10 亿元素: log₂(10^9) ≈ 29.9 → 最多 30 次比较
    `,
  },

  // ==================== 实际应用 ====================
  {
    name: '频率限制场景',
    description: '使用 IntSet 实现高效的 API 频率限制',
    initialSet: [],
    operations: [
      { type: 'batchInsert', params: { values: [1700000001000, 1700000002000, 1700000003000] } },
    ],
    expectedResult: '基于时间戳的频率控制',
    difficulty: '进阶',
    category: '实际应用',
    learningGoals: [
      '理解如何用 IntSet 存储时间戳实现频率限制',
      '观察基于时间窗口的请求计数方法',
      '理解滑动窗口 vs 固定窗口的区别',
    ],
    whyMatters: '频率限制是 API 安全的基础设施。使用 IntSet 存储时间戳可以实现精确的滑动窗口限流，每分钟/每秒允许 N 次请求的策略。这比 Redis 的内置限流命令更灵活，可以实现复杂的业务规则。',
    howItWorks: [
      '每次请求时，将当前时间戳（毫秒）添加到 IntSet',
      '使用 SREMRANGEBYSCORE 删除过期的时间戳',
      '使用 SCARD 获取当前窗口内的请求数',
      '如果超过限制，返回 429 Too Many Requests',
      '时间窗口滑动：只保留最近 60 秒的记录',
    ],
    redisCommands: [
      '// 用户请求频率限制（每分钟 60 次）',
      'SADD ratelimit:user:123 1700000001000',
      'EXPIRE ratelimit:user:123 120          // 2分钟后过期',
      'SREMRANGEBYSCORE ratelimit:user:123 0 1700000000000  // 删除60秒前的',
      'SCARD ratelimit:user:123               // 当前请求数',
      '// 如果 SCARD < 60，允许请求；否则拒绝',
    ],
    timeComplexity: 'O(log n) 插入, O(n) 清理过期数据',
    spaceComplexity: 'O(n) 时间窗口内的请求数',
    realWorldUseCase: 'API 频率限制；防止爬虫； DDoS 防护；用户操作频率控制（如每小时发送 3 封邮件）',
    keyTakeaway: 'IntSet 的时间戳存储非常适合频率限制场景，结合过期清理可实现滑动窗口控制。',
    commonPitfalls: [
      '未设置过期时间导致内存泄漏',
      '时间窗口设置不合理（太大或太小）',
    ],
    performanceTips: [
      '使用 SCAN 而非 KEYS 遍历所有限流记录',
      '考虑使用固定窗口而非滑动窗口以减少计算',
    ],
    memoryLayout: `
频率限制实现示意:
┌─────────────────────────────────────────────────────────────┐
│  时间窗口: 最近 60 秒                                        │
│  当前时间: 1700000060000 (假设)                              │
├─────────────────────────────────────────────────────────────┤
│  ratelimit:user:123:                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1700000001000  (60秒前)  ← 待清理                     │  │
│  │ 1700000002000  (59秒前)  ← 待清理                     │  │
│  │ 1700000003000  (58秒前)  ← 待清理                     │  │
│  │ 1700000059000  (1秒前)   ← 保留                       │  │
│  │ 1700000060000  (当前)     ← 保留                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  清理后 (删除 < 1700000000000 的元素):                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1700000059000                                        │  │
│  │ 1700000060000                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  SCARD = 2 < 60，允许通过                                   │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: '用户签到场景',
    description: '使用 IntSet 记录用户每日签到，实现连续签到统计',
    initialSet: [20231201, 20231205, 20231210, 20231215, 20231220],
    operations: [
      { type: 'insert', params: { value: 20231225 } },
    ],
    expectedResult: '记录用户签到日期，计算连续签到天数',
    difficulty: '进阶',
    category: '实际应用',
    learningGoals: [
      '理解如何用 IntSet 存储日期（YYYYMMDD 格式）',
      '学习如何计算连续签到天数',
      '观察签到数据的高效查询方法',
    ],
    whyMatters: '签到是提升用户活跃度的常用手段。使用 IntSet 存储签到日期可以高效判断某日是否已签到、计算连续签到天数、统计月度签到次数。这比使用字符串或 Hash 存储更节省空间且查询更快。',
    howItWorks: [
      '将日期转换为整数格式（20231225 = 2023年12月25日）',
      '用户签到时 SADD checkin:user:123 20231225',
      '检查是否签到：SISMEMBER checkin:user:123 20231225',
      '计算连续签到：从今天向前遍历，检查每天是否签到',
      '月度统计：使用 SRANGEBYSCORE 获取某月所有签到',
    ],
    redisCommands: [
      '// 用户 123 的签到记录',
      'SADD checkin:user:123 20231201 20231205 20231210 20231215 20231220',
      'SISMEMBER checkin:user:123 20231225  // 0: 未签到',
      '// 签到后:',
      'SADD checkin:user:123 20231225       // 返回 1（新增）',
      '// 查询 12 月签到次数:',
      'SRANGEBYSCORE checkin:user:123 20231201000000 20231231235959',
      'SCARD checkin:user:123               // 总签到次数: 6',
    ],
    timeComplexity: 'O(1) 签到, O(log n) 查询, O(k) 连续计算',
    spaceComplexity: 'O(n) 签到天数',
    realWorldUseCase: 'App 每日签到功能；连续签到奖励系统；月度签到统计；打卡挑战活动',
    keyTakeaway: '日期转整数存储是 IntSet 的经典用法，YYYYMMDD 格式既方便比较又易读。',
    commonPitfalls: [
      '使用字符串存储日期（浪费内存且查询慢）',
      '未考虑跨年连续签到的边界情况',
    ],
    performanceTips: [
      '批量导入历史签到数据用 SADD ... 一次添加',
      '设置合理的过期时间删除过老数据',
    ],
    memoryLayout: `
签到数据存储示例:
┌─────────────────────────────────────────────────────────────┐
│  用户 123 的签到记录 (checkin:user:123)                     │
│                                                             │
│  存储值: 20231201, 20231205, 20231210, 20231215, 20231220   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  INT16 编码（日期整数 < 32767）                       │  │
│  │  [20231201] [20231205] [20231210] [20231215] [20231220]│  │
│  │    2B        2B        2B        2B        2B        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  日期格式说明:                                               │
│  20231225 = 2023年12月25日                                  │
│  优点: 整数比较即日期比较，易于排序                           │
│                                                             │
│  连续签到计算逻辑:                                           │
│  today = 20231225                                           │
│  依次检查: 20231225, 20231224, 20231223...                  │
│  遇到未签到则停止，累计数量即为连续天数                       │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: '去重场景',
    description: '使用 IntSet 高效去除重复的整数 ID',
    initialSet: [100, 200, 300],
    operations: [
      { type: 'insert', params: { value: 200 } },  // 重复
      { type: 'insert', params: { value: 400 } },  // 新值
    ],
    expectedResult: '自动去除重复，返回实际新增数量',
    difficulty: '入门',
    category: '实际应用',
    learningGoals: [
      '理解 IntSet 自动去重的特性',
      '学习如何使用 SADD 的返回值判断是否新增',
      '观察去重操作对集合大小的影响',
    ],
    whyMatters: 'IntSet 的核心特性之一就是自动去重。当使用 SADD 添加已存在的元素时，不会产生重复，且返回值会告诉你这次操作实际添加了多少个新元素。这使得去重操作变得简单高效。',
    howItWorks: [
      'SADD 命令会自动检查元素是否已存在',
      '如果存在，不做任何操作，返回 0',
      '如果不存在，插入并返回 1',
      '支持批量添加，返回成功添加的数量',
      '这是 IntSet 作为"集合"的基本语义',
    ],
    redisCommands: [
      'SADD ids 100 200 300         // 返回 3，添加了 3 个',
      'SADD ids 200                  // 返回 0，200 已存在',
      'SADD ids 200 300 400          // 返回 1，只有 400 是新的',
      'SADD ids 500 600 700          // 返回 3，全部是新添加',
      'SMEMBERS ids                  // [100, 200, 300, 400, 500, 600, 700]',
    ],
    timeComplexity: 'O(1) 单值, O(k log k) 批量',
    spaceComplexity: 'O(n)',
    realWorldUseCase: '用户标签去重；商品分类去重；消息消费去重（幂等性）；爬虫 URL 去重',
    keyTakeaway: 'SADD 的返回值即去重结果，可用于判断是否需要进一步处理。',
    commonPitfalls: [
      '未检查 SADD 返回值丢失去重信息',
      '在需要保留顺序的场景误用 IntSet',
    ],
    performanceTips: [
      '批量去重用 SADD ... 而非循环 SADD 单个',
      'SADD 返回值可以简化业务逻辑判断',
    ],
    memoryLayout: `
去重操作示意:
┌─────────────────────────────────────────────────────────────┐
│  初始状态: ids = [100, 200, 300]                            │
│                                                             │
│  执行 SADD ids 200 400:                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  200 已存在 → 跳过，不产生重复                         │  │
│  │  400 不存在 → 添加到末尾                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  结果: ids = [100, 200, 300, 400]                           │
│  SADD 返回: 1（只有 400 是新增的）                          │
│                                                             │
│  内存变化:                                                   │
│  Before: length=3, 数据区=6B                                │
│  After:  length=4, 数据区=8B                                │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: 'UV 统计场景',
    description: '使用 IntSet 统计独立访客数量',
    initialSet: [1001, 1002, 1003],
    operations: [
      { type: 'insert', params: { value: 1002 } },  // 回访用户
      { type: 'insert', params: { value: 1004 } },  // 新访客
    ],
    expectedResult: '精确的独立访客统计',
    difficulty: '进阶',
    category: '实际应用',
    learningGoals: [
      '理解 UV 统计的核心：去重',
      '学习日 UV、周 UV、月 UV 的实现思路',
      '理解 IntSet 的内存效率如何支持大规模 UV 统计',
    ],
    whyMatters: '独立访客（UV）是互联网分析的核心指标。与 PV（页面浏览）不同，UV 需要识别独立个体并去重。使用 IntSet 存储用户 ID 可以高效完成日、周、月级别的 UV 统计，且比数据库查询快得多。',
    howItWorks: [
      '每次页面访问时，记录用户 ID',
      '使用 SADD 添加用户 ID（自动去重）',
      '使用 SCARD 获取当日/周/月的独立用户数',
      '每日凌晨使用 RENAME 切换新的一天',
      '旧数据可持久化后删除，或归档到数据库',
    ],
    redisCommands: [
      '// 页面访问时记录',
      'SADD uv:daily:20231225 1001 1002 1003',
      '// 同一用户再次访问',
      'SADD uv:daily:20231225 1002    // 返回 0，无效访问',
      '// 获取当日 UV',
      'SCARD uv:daily:20231225        // 返回 3',
      '// 获取周 UV（合并 7 天数据）',
      'SUNIONSTORE uv:weekly:52 uv:daily:20231219 uv:daily:20231220 ...',
      'SCARD uv:weekly:52             // 返回周独立访客数',
    ],
    timeComplexity: 'O(1) 记录访问, O(n) 周/月统计',
    spaceComplexity: 'O(d) d 为独立访客数',
    realWorldUseCase: '网站 Analytics；活动参与人数统计；实时在线人数；DAU/WAU/MAU 统计',
    keyTakeaway: 'IntSet 的自动去重 + SCARD 计数是 UV 统计的黄金组合，简洁高效。',
    commonPitfalls: [
      '日 UV key 未设置过期导致内存持续增长',
      '大 V 用户访问导致同 key 数据量过大',
    ],
    performanceTips: [
      '周/月 UV 用 SUNIONSTORE 而非遍历合并',
      '设置 key 过期时间自动清理旧数据',
    ],
    memoryLayout: `
UV 统计架构示意:
┌─────────────────────────────────────────────────────────────┐
│  每日 UV Key 结构:                                           │
│                                                             │
│  uv:daily:20231225                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [1001] [1002] [1003] [1004] ... (IntSet)              │  │
│  │  用户 ID 集合，自动去重                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  SCARD = 当日独立访客数                                      │
│                                                             │
│  周 UV 合并:                                                 │
│  SUNIONSTORE uv:weekly:52 uv:daily:20231219 uv:daily:20231220 uv:daily:20231221 uv:daily:20231222 uv:daily:20231223 uv:daily:20231224 uv:daily:20231225 │
│                                                             │
│  月 UV 合并:                                                 │
│  SUNIONSTORE uv:monthly:202312 uv:daily:20231201 ... uv:daily:20231231 │
│                                                             │
│  Key 过期策略:                                               │
│  日 UV: 2 天后自动删除                                       │
│  周 UV: 8 天后删除                                          │
│  月 UV: 35 天后删除                                         │
└─────────────────────────────────────────────────────────────┘
    `,
  },
  {
    name: '好友关系场景',
    description: '使用 IntSet 存储用户好友 ID 列表',
    initialSet: [2001, 2002, 2003],
    operations: [
      { type: 'insert', params: { value: 2004 } },
    ],
    expectedResult: '高效的好友关系存储与查询',
    difficulty: '进阶',
    category: '实际应用',
    learningGoals: [
      '理解 IntSet 适合存储有序 ID 列表',
      '学习判断是否为好友（快速查找）',
      '理解如何用集合运算实现共同好友',
    ],
    whyMatters: '好友关系是社交应用的核心数据。使用 IntSet 存储好友 ID 可以实现 O(log n) 的是否好友判断，以及 O(n+m) 的共同好友计算。这比使用 List 存储更高效，比使用 Hash 存储更节省内存。',
    howItWorks: [
      '用户 A 的好友列表存储为 IntSet: friends:A',
      '添加好友：SADD friends:A 2001',
      '判断是否为好友：SISMEMBER friends:A 2001',
      '共同好友：SINTER friends:A friends:B',
      '可能认识（好友的好友）：SUNION friends:A friends:B 再减已好友',
    ],
    redisCommands: [
      '// 小明的关注列表',
      'SADD friends:xiaoming 2001 2002 2003',
      'SISMEMBER friends:xiaoming 2001  // 1: 是好友',
      'SISMEMBER friends:xiaoming 9999  // 0: 不是好友',
      '// 小红的好友列表',
      'SADD friends:xiaohong 2002 2003 2004',
      '// 共同好友',
      'SINTER friends:xiaoming friends:xiaohong  // [2002, 2003]',
      '// 小明认识的新朋友',
      'SDIFF friends:xiaohong friends:xiaoming  // [2004]',
    ],
    timeComplexity: 'O(1) 判断好友, O(n+m) 共同好友',
    spaceComplexity: 'O(n) n 为好友数',
    realWorldUseCase: '社交应用好友列表；关注/粉丝系统；共同好友推荐；可能认识的人推荐',
    keyTakeaway: '集合运算（SINTER, SUNION, SDIFF）使得复杂社交关系查询变得简单高效。',
    commonPitfalls: [
      '好友数过多时 IntSet 查询仍比 Hash 慢',
      '未考虑双向好友与单向关注的区别',
    ],
    performanceTips: [
      '好友数超过 10000 时考虑拆分或用 Hash',
      '频繁的共同好友计算可用 Redis Module 优化',
    ],
    memoryLayout: `
好友关系存储示意:
┌─────────────────────────────────────────────────────────────┐
│  小明的好友列表 (friends:xiaoming)                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [2001] [2002] [2003] [2004]                          │  │
│  │  小王    小红    小张    小李                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  小红的好友列表 (friends:xiaohong)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [2002] [2003] [2004] [2005]                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  集合运算结果:                                               │
│  SINTER (交集): [2002, 2003] → 共同好友                     │
│  SDIFF  (差集): [2001]    → 小明有但小红没有的好友          │
│  SUNION (并集): [2001, 2002, 2003, 2004, 2005]              │
└─────────────────────────────────────────────────────────────┘
    `,
  },
];

// Visual flow diagram component for operations
const OperationFlow: React.FC<{ steps: string[] }> = ({ steps }) => (
  <div className="operation-flow">
    {steps.map((step, idx) => (
      <React.Fragment key={idx}>
        <div className="flow-step">
          <span className="flow-number">{idx + 1}</span>
          <span className="flow-text">{step}</span>
        </div>
        {idx < steps.length - 1 && <div className="flow-arrow">↓</div>}
      </React.Fragment>
    ))}
  </div>
);

// Memory layout diagram component
const MemoryDiagram: React.FC<{ layout: string }> = ({ layout }) => (
  <pre className="memory-diagram">{layout}</pre>
);

// Complexity badge component
const ComplexityBadge: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="complexity-badge">
    <span className="complexity-icon">{icon}</span>
    <span className="complexity-label">{label}:</span>
    <span className="complexity-value">{value}</span>
  </div>
);

const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '入门': return 'difficulty-easy';
      case '进阶': return 'difficulty-medium';
      case '高级': return 'difficulty-hard';
      default: return '';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case '入门': return <CheckCircle size={14} />;
      case '进阶': return <Layers size={14} />;
      case '高级': return <Zap size={14} />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '基础操作': return 'category-basics';
      case '编码升级': return 'category-encoding';
      case '性能优化': return 'category-performance';
      case '实际应用': return 'category-realworld';
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '基础操作': return <Layers size={14} />;
      case '编码升级': return <TrendingUp size={14} />;
      case '性能优化': return <Activity size={14} />;
      case '实际应用': return <Target size={14} />;
      default: return null;
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'insert': return <Plus size={16} />;
      case 'search': return <Search size={16} />;
      case 'delete': return <Trash2 size={16} />;
      case 'batchInsert': return <Plus size={16} />;
      default: return <ArrowRight size={16} />;
    }
  };

  const filteredScenarios = selectedCategory
    ? EXTENDED_SCENARIOS.filter(s => s.category === selectedCategory)
    : EXTENDED_SCENARIOS;

  return (
    <div className="scenarios-page">
      <div className="scenarios-container">
        <div className="scenarios-header">
          <h1>学习场景</h1>
          <p className="scenarios-subtitle">
            通过交互式场景，深入理解 Redis IntSet 的工作原理
          </p>
        </div>

        {/* How it works intro */}
        <div className="scenarios-intro">
          <div className="intro-grid">
            <div className="intro-card">
              <div className="intro-icon">
                <Database size={24} />
              </div>
              <h3>什么是 IntSet？</h3>
              <p>IntSet 是 Redis 用于存储整数集合的数据结构，采用连续的内存空间存储有序整数，支持高效的二分查找。</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">
                <Layers size={24} />
              </div>
              <h3>编码升级机制</h3>
              <p>当元素值超出当前编码范围时，IntSet会自动升级编码（INT16 → INT32 → INT64），确保能存储任意大小的整数。</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">
                <Clock size={24} />
              </div>
              <h3>时间复杂度</h3>
              <p>查找操作 O(log n)，插入和删除操作 O(n)。二分查找使得百万级数据仅需约20次比较即可定位。</p>
            </div>
            <div className="intro-card">
              <div className="intro-icon">
                <MemoryStick size={24} />
              </div>
              <h3>内存效率</h3>
              <p>IntSet使用连续内存存储，比Hash表更紧凑。当存储大量整数时，比普通Set节省约60%内存。</p>
            </div>
          </div>
        </div>

        {/* Featured Animation Demo */}
        <div className="featured-demo">
          <h2>动画演示</h2>
          <p className="featured-demo-subtitle">通过动画深入理解 IntSet 的核心操作</p>
          <div className="featured-video-grid">
            <VideoEmbed
              title="编码升级演示"
              description="插入大值时触发 INT16 → INT32 → INT64 升级"
              component={EncodingUpgradeVideo}
              props={{ initialEncoding: 'INT16', triggerValue: 100000 }}
              autoplay={true}
              aspectRatio="16:9"
            />
            <VideoEmbed
              title="二分查找演示"
              description="O(log n) 时间复杂度的查找过程"
              component={BinarySearchVideo}
              props={{ searchValue: 50, data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }}
              autoplay={true}
              aspectRatio="16:9"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <h2>场景分类</h2>
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <Shield size={16} />
              全部场景
              <span className="category-count">{EXTENDED_SCENARIOS.length}</span>
            </button>
            {SCENARIO_CATEGORIES.map((cat) => {
              const count = EXTENDED_SCENARIOS.filter(s => s.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  className={`category-tab ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.icon}
                  {cat.name}
                  <span className="category-count">{count}</span>
                </button>
              );
            })}
          </div>
          {selectedCategory && (
            <p className="category-description">
              {SCENARIO_CATEGORIES.find(c => c.name === selectedCategory)?.description}
            </p>
          )}
        </div>

        {/* Scenarios List */}
        <div className="scenarios-section">
          <h2>
            {selectedCategory
              ? `${selectedCategory}场景`
              : '全部场景'}
          </h2>
          <div className="scenarios-grid">
            {filteredScenarios.map((scenario) => {
              const originalIndex = EXTENDED_SCENARIOS.indexOf(scenario);
              return (
                <div
                  key={originalIndex}
                  className={`scenario-card ${selectedScenario === originalIndex ? 'selected' : ''} ${expandedDetails === originalIndex ? 'details-expanded' : ''}`}
                  onClick={() => {
                    setSelectedScenario(selectedScenario === originalIndex ? null : originalIndex);
                    setExpandedDetails(null);
                  }}
                >
                  <div className="scenario-card-header">
                    <div className="scenario-meta-row">
                      <span className={`difficulty-badge ${getDifficultyColor(scenario.difficulty)}`}>
                        {getDifficultyIcon(scenario.difficulty)}
                        {scenario.difficulty}
                      </span>
                      <span className={`category-badge ${getCategoryColor(scenario.category)}`}>
                        {getCategoryIcon(scenario.category)}
                        {scenario.category}
                      </span>
                      <div className="complexity-row">
                        <ComplexityBadge icon={<Clock size={12} />} label="时间" value={scenario.timeComplexity} />
                        <ComplexityBadge icon={<MemoryStick size={12} />} label="空间" value={scenario.spaceComplexity} />
                      </div>
                    </div>
                    <h3>{scenario.name}</h3>
                    <p className="scenario-description">{scenario.description}</p>
                  </div>

                  {/* Real World Use Case */}
                  <div className="use-case-box">
                    <span className="use-case-label">实际应用</span>
                    <p>{scenario.realWorldUseCase}</p>
                  </div>

                  {/* Why it matters */}
                  <div className="why-matters">
                    <h4>为什么重要</h4>
                    <p>{scenario.whyMatters}</p>
                  </div>

                  {/* Key Takeaway */}
                  <div className="key-takeaway">
                    <h4>核心要点</h4>
                    <p>{scenario.keyTakeaway}</p>
                  </div>

                  {/* Operation flow */}
                  <div className="operation-preview">
                    <h4>操作流程</h4>
                    <div className="operations-list">
                      {scenario.operations.map((op, opIdx) => (
                        <div key={opIdx} className="operation-item">
                          {getOperationIcon(op.type)}
                          <span>{op.type === 'batchInsert'
                            ? `批量插入 [${(op.params.values as number[]).join(', ')}]`
                            : `${op.type}: ${op.params.value ?? ''}`
                          }</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Pitfalls */}
                  {scenario.commonPitfalls && scenario.commonPitfalls.length > 0 && (
                    <div className="pitfalls-box">
                      <h4>
                        <Shield size={14} />
                        常见误区
                      </h4>
                      <ul>
                        {scenario.commonPitfalls.map((pitfall, idx) => (
                          <li key={idx}>{pitfall}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Performance Tips */}
                  {scenario.performanceTips && scenario.performanceTips.length > 0 && (
                    <div className="tips-box">
                      <h4>
                        <Zap size={14} />
                        性能建议
                      </h4>
                      <ul>
                        {scenario.performanceTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expanded details */}
                  {selectedScenario === originalIndex && (
                    <div className="scenario-expanded">
                      {/* How it works */}
                      <div className="detail-section">
                        <h4>
                          <ArrowRight size={16} />
                          工作原理
                        </h4>
                        <OperationFlow steps={scenario.howItWorks} />
                      </div>

                      {/* Memory layout */}
                      {scenario.memoryLayout && (
                        <div className="detail-section">
                          <h4>
                            <MemoryStick size={16} />
                            内存布局
                          </h4>
                          <MemoryDiagram layout={scenario.memoryLayout} />
                        </div>
                      )}

                      {/* Redis commands */}
                      <div className="detail-section">
                        <h4>
                          <Database size={16} />
                          Redis 命令
                        </h4>
                        <div className="redis-commands">
                          {scenario.redisCommands.map((cmd, cmdIdx) => (
                            <code key={cmdIdx}>{cmd}</code>
                          ))}
                        </div>
                      </div>

                      {/* Learning goals */}
                      <div className="detail-section">
                        <h4>学习目标</h4>
                        <ul className="learning-goals-list">
                          {scenario.learningGoals.map((goal, idx) => (
                            <li key={idx}>
                              <CheckCircle size={14} />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="scenario-actions">
                    <button
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/playground', { state: { scenario } });
                      }}
                    >
                      <Play size={16} />
                      运行场景
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScenario(selectedScenario === originalIndex ? null : originalIndex);
                        setExpandedDetails(expandedDetails === originalIndex ? null : originalIndex);
                      }}
                    >
                      {selectedScenario === originalIndex && expandedDetails === originalIndex ? '收起详情' : '查看详情'}
                      <ChevronRight size={16} className={selectedScenario === originalIndex && expandedDetails === originalIndex ? 'rotate' : ''} />
                    </button>
                    {SCENARIO_VIDEOS[scenario.name] && (
                      <button
                        className="action-btn tertiary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideo(SCENARIO_VIDEOS[scenario.name]);
                        }}
                      >
                        <Video size={16} />
                        视频
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="scenarios-footer">
          <div className="footer-content">
            <h3>准备好开始实践了吗？</h3>
            <p>在交互演示页面，你可以手动执行这些场景，或者自定义你自己的测试用例</p>
            <div className="footer-actions">
              <button className="cta-btn primary" onClick={() => navigate('/playground')}>
                <Play size={18} />
                前往演示页面
              </button>
              <button className="cta-btn secondary" onClick={() => navigate('/tutorial')}>
                <ArrowRight size={18} />
                查看教程
              </button>
            </div>
          </div>
        </div>
      </div>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default ScenariosPage;
