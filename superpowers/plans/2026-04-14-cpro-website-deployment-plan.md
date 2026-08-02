# 支线任务：656产品审阅部署计划

> **创建日期**: 2026-04-14
> **任务类型**: 支线任务（Website部署）
> **状态**: 待执行
> **优先级**: P0（API限流期间聚焦）

---

## 一、任务背景与目标

### 1.1 口径对齐

| 口径 | 数字 | 说明 |
|------|------|------|
| A级源码 | **997** 个 | mql_files quality_grade='A' |
| 编译成功产品 | **656** 个 | cpro_patched 目录有 .ex4/.ex5 编译产物 |
| brand_products已有 | 1,097 条 | YCT前缀品牌化产品 |
| code_reviews已有 | 1,159 条 | 历史审阅记录 |
| download_packages已有 | 100 个 | 现有下载包（仅含.mq源码，非.ex编译产物）|
| **本次新增** | **656 产品** | 目标：审阅后全部部署上线 |

### 1.2 任务目标

将 **656 个编译成功产品** 按照 **19产品审阅标准**，分批次完成：
1. AI专家审阅（产品化描述 + 质量评分）
2. 审阅结果写入 brand_products（grade / description / tech_highlights）
3. 创建正确下载包（含编译后 .ex5/.ex4 文件）
4. 生成 products_data.json 供 Website 使用
5. Website 展示 + 下载功能上线

---

## 二、参照标准：19产品工序

### 2.1 19产品工序流程（已验证）

```
Step 1: 批次审阅
  └── review_prompt.txt (30文件/批)
        ↓ AI审阅
  review_results_batch*.json

Step 2: 审阅结果聚合
  └── review_aggregator.py
        ↓ 写入数据库
  code_reviews 表 (1,159条已有)

Step 3: 品牌化打标
  └── brand_patcher.py
        ↓ 写入brand_products表
  brand_products (1,097条已有，但grade/description全空)

Step 4: 手工enrichment
  └── 手工补充description/friendly_level/setup_guide
        ↓
  products_data.json (19产品，丰富metadata)

Step 5: Website部署
  └── Flask app.py + templates
        ↓
  Website上线（静态JSON + Flask路由）
```

### 2.2 19产品 products_data.json 字段标准

```json
{
  "filename": "peterthomet_EA_Snippets_Breakout_LondonOpen.mq5",
  "name": "顺势伦敦",
  "name_subtitle": "经典时段顺势EA",
  "friendly_level": 5,
  "friendly_stars": "⭐⭐⭐⭐⭐",
  "product_type": "专项工具",
  "product_type_icon": "◆",
  "description": "经典伦敦时段突破策略...",
  "core_pain_solved": "解决'不知道什么时候该入场'的问题...",
  "scenarios": ["兼职交易者", "追求低频高效", "新手入门"],
  "setup_guide": "1. 下载mq5文件到MT5的Experts文件夹\n2. 重启MT5...",
  "parameters": { "BOMargin": "突破确认的保证金点数..." },
  "tags": ["伦敦突破", "经典策略"],
  "source_path": "原始文件名.mq5"
}
```

---

## 三、分批次执行计划

### 3.1 批次划分

| 批次 | 产品范围 | 产品数 | 状态 |
|------|---------|-------|------|
| Batch 001 | CPro_EA_* 第1组 | ~30 | 🔲 待执行 |
| Batch 002 | CPro_EA_* 第2组 | ~30 | 🔲 待执行 |
| ... | ... | ... | 🔲 待执行 |
| Batch 022 | 最后一批 | ~26 | 🔲 待执行 |
| **合计** | | **656** | |

**策略**: 按 cpro_patched 目录顺序遍历，优先处理有 .ex5 编译产物的产品（MT5用户更活跃）

### 3.2 每批次工序

```
For each batch (30 products):
  ├── Step 1: 生成审阅Prompt
  │     └── 参照 review_prompt_batch*.txt 格式
  │     └── 输出: src/review_prompt_batch{N}.txt
  │
  ├── Step 2: 执行AI审阅（需解决API限流问题）
  │     └── 每次审阅30个产品，约需10-15分钟
  │     └── 输出: src/review_results_batch{N}.json
  │
  ├── Step 3: 写入code_reviews表
  │     └── 参照 review_aggregator.py
  │     └── 确保 file_id 匹配 cpro_patched 路径
  │
  ├── Step 4: 更新brand_products
  │     └── 从 code_reviews 读取
  │     └── 填充: grade, description, tech_highlights
  │     └── 创建download_package（含.ex文件）
  │
  └── Step 5: 中间checkpoint
        └── 保存进度到 products_data_batch{N}.json
```

---

## 四、核心脚本清单

| 脚本 | 用途 | 输入 | 输出 |
|------|------|------|------|
| `batch_reviewer.py` | 生成审阅Prompt | cpro_patched文件列表 | review_prompt_batch{N}.txt |
| `review_aggregator.py` | 聚合审阅结果 | review_results_batch{N}.json | code_reviews表 |
| `brand_patcher.py` | 品牌化打标 | code_reviews | brand_products表 |
| `cpro_brand_patcher.py` | 编译产物打包 | cpro_patched/.ex文件 | download_packages/*.zip |
| `website_product_generator.py` | 生成products_data | brand_products | products_data_batch{N}.json |

---

## 五、数据流设计

### 5.1 file_id 匹配问题（历史遗留）

**问题**: code_reviews 的 file_id 存的是原始路径，无法匹配 cpro_patched 路径

**解决方案**: 新审阅时使用 cpro_patched 的 product_id 作为 file_id

```python
# cpro_patched 目录结构
CPro_EA_Amazing_MT5/
  Amazing.mq5          ← 源码
  Amazing.ex5          ← 编译产物

# 新的 file_id 格式
product_id = "CPro_EA_Amazing_MT5"
file_id = "CPro_EA_Amazing_MT5/Amazing.mq5"
```

### 5.2 brand_products 填充逻辑

```python
# 审阅后 → brand_products 更新
UPDATE brand_products SET
  grade = (SELECT code_quality FROM code_reviews WHERE file_id = brand_products.source_file_id),
  description = (SELECT description FROM code_reviews WHERE ...),
  tech_highlights = (SELECT json_build_object(...) FROM code_reviews WHERE ...),
  download_package = '/path/to/compiled/CPro_EA_Amazing_MT5.zip'  # 包含.ex文件
WHERE source_file_id = '...'
```

### 5.3 下载包结构

```
YCT_Amazing_MT5_v2.0.0.zip
├── Amazing.mq5              # 源码（品牌化patched）
├── Amazing.ex5               # 编译产物（直接用cpro_patched的）
└── README.txt                 # 安装说明
```

---

## 六、API限流应对策略

### 6.1 限流现状

- Batch 006/008/010/011 历史失败（API 529错误）
- 每次审阅 30 个文件约消耗 200K-500K tokens

### 6.2 应对方案

| 策略 | 说明 | 优先级 |
|------|------|--------|
| 降低批次大小 | 30→15文件/批，降低单次token消耗 | P1 |
| 增加重试间隔 | 失败后等待5分钟再重试 | P1 |
| 限流时暂停 | 收到529后自动暂停，不强行继续 | P2 |
| 使用Haiku模型 | 用Haiku 4.5处理审阅，降低成本 | P2 |

### 6.3 限流时执行流程

```
检测到API限流 (529/429)
  → 保存当前批次进度（已完成文件列表）
  → 等待5分钟
  → 重试当前批次
  → 3次重试失败后 → 跳过该批次，继续下一批次
  → 记录 skipped_batches 清单
```

---

## 七、进度追踪

### 7.1 执行状态

| 批次 | 状态 | 审阅数 | 推荐数 | 问题 |
|------|------|-------|-------|------|
| (历史) | ✅ | 1,159条(总) | 494条 | file_id路径不匹配 |
| Batch 001-022 | 🔲 | 0/656 | - | 待启动 |

### 7.2 完成标准

- [ ] 656产品全部审阅完成
- [ ] brand_products 656条全部有 grade + description
- [ ] download_packages 656个zip（含.ex编译产物）
- [ ] products_data.json 覆盖全部656产品
- [ ] Website可访问 + 下载功能正常

### 7.3 风险项

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| API限流反复 | 高 | 中 | 降低批次大小，重试机制 |
| cpro_patched路径变化 | 低 | 高 | 固定时间戳快照 |
| brand_products写入失败 | 中 | 中 | 先导出JSON备份 |
| .ex文件缺失 | 低 | 中 | 跳过该产品，标记为"仅源码" |

---

## 八、依赖关系

```
[主线任务 - API限流时暂停]
        ↓ (限流时支线可独立执行)
[Step 1: 批次审阅] ───────────────────────────────────┐
        ↓                                              │
[Step 2: code_reviews聚合] ──────────────────────────→│
        ↓                                              │
[Step 3: brand_products填充] ─────────────────────────→│
        ↓                                              │
[Step 4: download_package重建] ──────────────────────→│
        ↓                                              │
[Step 5: products_data.json生成] ───────────────────→│
        ↓                                              │
[Step 6: Website部署] ◀────────────────────────────────┘
```

---

## 九、存档文件索引

| 文件 | 位置 |
|------|------|
| 本计划 | `docs/superpowers/plans/2026-04-14-cpro-website-deployment-plan.md` |
| 审阅Prompt模板 | `mql5-phase2/src/review_prompt.txt` |
| 审阅结果聚合 | `mql5-phase2/src/pipeline/review_aggregator.py` |
| 品牌化打标 | `mql5-phase2/src/pipeline/brand_patcher.py` |
| 编译产物打包 | `mql5-phase2/src/pipeline/cpro_brand_patcher.py` |
| 19产品参照标准 | `mql5-phase2/output/website/products_data.json` |
| Website模板 | `mql5-phase2/src/website/templates/` |
| Flask路由 | `mql5-phase2/src/website/app.py` |
| 编译产物目录 | `mql5-phase2/output/cpro_patched/` |
| 下载包目录 | `mql5-phase2/output/download_packages/` |
| 数据库 | `mql5-phase2/output/db/master.db` |

---

## 十、下一步行动

### 立即执行（支线任务P0）

1. **修复 file_id 匹配问题**
   - 修改 review_prompt_batchN.txt，使用 cpro_patched 的 product_dir/file 路径作为 file_id
   - 避免与历史 code_reviews 混淆

2. **执行第1批试点（Batch 001）**
   - 选取前30个产品做试点
   - 验证完整流程：审阅 → code_reviews → brand_products → download_package → products_data.json

3. **验证下载包内容**
   - 确认 zip 包含 .ex5/.ex4 编译产物
   - 确认 Website download 路由正常工作

### 试点成功后

4. **批量执行 Batch 002-022**
5. **每5批次做一次 checkpoint**
6. **完成后生成完整 products_data.json**

---

**版本**: v1.0
**创建**: 2026-04-14
**下一步**: Batch 001 试点执行
