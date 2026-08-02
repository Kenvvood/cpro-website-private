# MT4/MT5 开源源码筛选 - Phase 2 双轨并行计划

> **修订版本 (v2.0) — 2026-04-14**
>
> **基调：**
> - **主线**：长期战略工程，后台并行运行，不急于完成
> - **支线**：过渡引流方案，快速见效，用户思维优先

---

## 战略定位

### 主线 — 可视化模块积木系统（长期战略）

**本质**：为未来可视化EA搭建平台打基础

**核心思路**：将优质源码重构为独立功能模块，用户通过拖拽组合方式搭建个性化EA脚本

**模块示例**：

| 模块类型 | 示例模块 |
|---------|---------|
| 跟单模块 | `CopyTradeModule` — 跟单功能核心 |
| 止损模块 | `TrailingStopModule` — 追踪止损 |
| 风控模块 | `RiskManagementModule` — 仓位管理 |
| 信号模块 | `SignalGeneratorModule` — 信号生成 |
| 界面模块 | `UIOverlayModule` — 图表界面 |

**用户场景**：选择"跟单模块" + "追踪止损模块" + "风控模块" → 自动组合成个性化跟单EA

### 支线 — 快速引流落地页（过渡方案）

**本质**：在公司网站展示可用的MT4/MT5源码，吸引目标用户

**核心思路**：以用户视角分类（"适合新手的5个EA"、"月赚1000点的趋势EA"），而非技术视角

---

## 双轨对比

| 维度 | 主线 (master) | 支线 (website-deploy-634) |
|------|--------------|--------------------------|
| **性质** | 长期战略工程 | 过渡引流方案 |
| **优先级** | 低（可并行运行） | **高（当前核心任务）** |
| **耗时** | 长（~1400文件） | 短（634文件） |
| **产出形式** | 模块化组件库 | 网站内容+引流素材 |
| **视角** | 开发者/系统视角 | **用户思维** |
| **完成标准** | 质量分级体系完善 | 快速上线生成流量 |
| **后期价值** | 可视化EA搭建平台基础 | 早期用户积累 |

---

## 支线任务 (website-deploy-634) — 快速引流

### 任务目标

对634个编译成功的源码文件进行**用户视角**评审和分级，快速部署到公司网站生成流量。

### 用户视角分类体系

> 区别于传统技术分级，以**用户需求场景**作为主要分类维度

#### 一级分类（按用户策略需求）

| 分类 | 用户场景 | 优先级 |
|------|---------|--------|
| **趋势跟踪EA** | "我想顺势交易赚大趋势的钱" | P0 |
| **头皮刷单EA** | "我追求高频小利润积少成多" | P0 |
| **均值回归EA** | "我想抄底摸顶稳定套利" | P1 |
| **跟单系统EA** | "我想复制高手单子自动跟单" | P1 |
| **风控工具EA** | "我有策略需要更好的风控" | P2 |
| **盯盘指标** | "我需要工具帮我盯盘，第一时间发现交易机会" | P0 |

#### 二级分类（按用户痛点）

| 分类 | 用户场景 |
|------|---------|
| **新手友好** | "我是新手，想要简单易用的EA/指标" |
| **低保证金** | "我账户小，需要能跑小资金的" |
| **高频交易** | "我追求极速反应和执行力" |
| **多货币对冲** | "我想做货币对冲降低风险" |
| **手机可用** | "我需要手机端也能用的工具" |
| **多图表监控** | "我需要同时看多个货币对的机会" |

#### 三级标签（技术指标/EA类型）

| 标签 | 说明 |
|------|------|
| `#趋势类` | 基于MA/EMA等趋势指标 |
| `#震荡类` | 基于RSI/Bollinger等震荡指标 |
| `#突破类` | 基于Breakout等突破策略 |
| `#马丁类` | 基于马丁格尔仓位管理 |
| `#网格类` | 基于网格交易 |
| `#盯盘提醒` | 价格/形态到达时即时提醒 |
| `#多货币监控` | 同时监控多个货币对 |
| `#一键下单` | 指标信号直接触发送订单 |

### 评审标准

**A级 — 立即可用**

- 编译0错误，0警告（或<3警告）
- 代码结构清晰，注释完整
- 功能完整，可直接回测或实盘
- 无外部依赖（已内置）

**B级 — 需小调整**

- 编译0错误，警告3-15个
- 功能基本完整，需少量适配
- 有注释但结构可优化

**C级 — 仅供学习参考**

- 编译有错误或警告>15个
- 功能不完整或依赖复杂
- 仅适合作为学习参考

### 产出物

```
output/website/
├── file_index.json              # 634文件索引（含用户标签）
├── grade_A.json                # A级文件列表
├── grade_B.json                # B级文件列表
├── grade_C.json                # C级文件列表
├── category_trend.json        # 趋势跟踪EA
├── category_scalping.json      # 头皮刷单EA
├── category_mean_reversion.json # 均值回归EA
├── category_copytrade.json     # 跟单系统EA
├── category_risk.json          # 风控工具EA
├── category_indicator.json     # 盯盘指标 ★新增
└── pages/                     # 生成的静态页面
    ├── index.html              # 落地页
    ├── list_trend.html         # 趋势类列表页
    ├── list_scalping.html      # 头皮类列表页
    ├── list_indicator.html     # 盯盘指标列表页 ★新增
    └── detail_*.html           # 单个EA/指标详情页
```

### 评审流程

```bash
# Step 1: 提取634个编译成功文件列表
pwsh output/query_logs.ps1 | ConvertFrom-Json | ConvertTo-Json -Depth 10 > output/website/file_index.json

# Step 2: 批量评审（每批20个，优先A级）
python src/pipeline/review_batch.py \
    --input output/website/file_index.json \
    --output reviews/website_batch1.json \
    --limit 20 \
    --user-perspective

# Step 3: 汇总+生成静态页
python src/website/generate.py \
    --input output/website/ \
    --output docs/website/
```

---

## 主线任务 (master) — 可视化模块积木系统

### 任务目标

对全部~1400个源文件进行开发者视角质量评审，建立模块化组件库，为未来可视化EA搭建平台奠基。

### 模块化设计思路

#### 模块标准格式

```cpp
// 模块接口标准
class IModule {
public:
    virtual string GetName() = 0;
    virtual string GetDescription() = 0;
    virtual map<string, string> GetParameters() = 0;
    virtual bool Validate() = 0;
    virtual void OnInit() {}
    virtual void OnTick() {}
    virtual void OnDeinit() {}
};

// 示例：跟单模块
class CCopyTradeModule : public IModule {
    string GetName() override { return "CopyTrade"; }
    // 跟单核心逻辑...
};

// 示例：追踪止损模块
class CTrailingStopModule : public IModule {
    string GetName() override { return "TrailingStop"; }
    // 追踪止损核心逻辑...
};
```

#### 模块分类体系

**核心模块（必须）**

| 模块 | 功能 |
|------|------|
| SignalModule | 信号生成（买入/卖出信号） |
| RiskModule | 风险管理（仓位/止损） |
| ExecutionModule | 订单执行（开仓/平仓） |

**增强模块（可选）**

| 模块 | 功能 |
|------|------|
| TrailingStopModule | 追踪止损 |
| CopyTradeModule | 跟单功能 |
| GridModule | 网格交易 |
| ScalpingModule | 头皮交易 |
| NewsFilterModule | 新闻过滤 |
| TimeFilterModule | 时间过滤 |

**界面模块**

| 模块 | 功能 |
|------|------|
| DashboardModule | 仪表盘显示 |
| AlertModule | 警报通知 |
| UIModule | 图表界面 |

### 评审标准

**A级模块 — 可直接复用**

- 编译0错误，0警告
- 符合模块接口标准
- 代码结构清晰（单一职责）
- 注释完整，API明确
- 无外部依赖或依赖已封装

**B级模块 — 可改造复用**

- 编译0错误，警告<10个
- 功能完整但需适配接口
- 代码结构尚可
- 有一定注释

**C级参考 — 学习用途**

- 编译有错误或警告>10个
- 功能特殊但实现混乱
- 依赖复杂或缺失

### 产出物

```
output/modules/
├── interfaces/              # 模块接口定义
│   ├── IModule.mqh
│   ├── ISignalModule.mqh
│   ├── IRiskModule.mqh
│   └── ...
├── core/                   # 核心A级模块
│   ├── SignalModule.mqh
│   ├── RiskModule.mqh
│   └── ...
├── enhanced/               # 增强B级模块
│   ├── TrailingStopModule.mqh
│   ├── CopyTradeModule.mqh
│   └── ...
├── reference/              # C级参考模块
│   └── ...
└── registry.json          # 模块注册表
```

### 评审流程

```bash
# 后台并行运行，不阻塞支线
nohup python src/pipeline/master_review.py \
    --input output/master_file_list.json \
    --output reviews/master_batch_{n}.json \
    --limit 50 \
    --module-perspective &

# 主线定期合并支线成果
git checkout master
git merge website-deploy-634
```

---

## 分支管理

```bash
# 查看分支
git branch -v

# 支线：当前工作分支（快速引流）
git checkout website-deploy-634

# 主线：后台运行（全量评审）
git checkout master

# 定期同步：支线合并主线更新
git checkout website-deploy-634
git merge master

# 完成后：主线合并支线最终成果
git checkout master
git merge website-deploy-634
```

---

## 并行工作流

```
┌─────────────────────────────────────────────────────────────┐
│                    主线 (master) - 后台并行                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Batch 1-5   │    │ Batch 6-10  │    │ Batch 11-N  │    │
│  │ 50文件/批   │ →  │ 50文件/批   │ →  │ 50文件/批   │    │
│  │ 模块化评审   │    │ 模块化评审   │    │ 模块化评审   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         ↓                   ↓                   ↓            │
│    output/modules/    output/modules/    output/modules/   │
│                                                             │
│  耗时：长（可接受）                                           │
│  优先级：低（不阻塞）                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 支线 (website-deploy-634) - 紧急优先          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Batch 1-5   │    │ Batch 6-10  │    │ Batch 11-22 │    │
│  │ 20文件/批   │ →  │ 20文件/批   │ →  │ 20文件/批   │    │
│  │ 用户视角    │    │ 用户视角    │    │ 用户视角    │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         ↓                   ↓                   ↓            │
│    output/website/    output/website/    output/website/  │
│                                                             │
│  耗时：短（约22批）                                           │
│  优先级：高（当前核心）                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │   网站部署上线    │
                    │   生成流量       │
                    └─────────────────┘
```

---

## 后续阶段

### Phase 3: 可视化EA搭建平台

- 模块拖拽编辑器
- 策略预览和回测
- 一键导出EA文件

### Phase 4: 社区生态

- 用户分享自定义策略
- 模块市场交易
- 开发者上传模块

---

*Plan version: v2.0 - 2026-04-14 - 双轨战略：主线长期工程 vs 支线快速引流*
