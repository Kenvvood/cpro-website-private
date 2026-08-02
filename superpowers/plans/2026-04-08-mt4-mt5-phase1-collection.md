# MT4/MT5 开源源码搜集 - Phase 1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从6个目标数据源搜集所有MT4/MT5开源源代码，建立原始资料库

**Architecture:** 建立目录结构作为搜集基础设施，通过多源并行搜集策略，从GitHub和各指定网站抓取EA/指标/脚本源码，建立索引便于后续筛选

**Tech Stack:** Python (requests/BeautifulSoup/GitHub API) / Bash脚本 / JSON元数据存储

---

## 目录结构设计

```
source-collection/                           # Phase 1 搜集产物
├── raw/                                     # 原始源码（按来源分类）
│   ├── github/                             # GitHub源码
│   ├── mql5-codebase/                     # MQL5官方Code Base
│   ├── mtctp/                             # mtctp.com
│   ├── mql4ea/                            # mql4ea.com
│   ├── fxznjy/                            # fxznjy.com
│   └── forex-station/                       # forex-station.com
│
├── metadata/                                # 元数据索引
│   ├── github-repos.json                   # GitHub仓库索引
│   ├── mql5-codebase-index.json           # MQL5 Code Base索引
│   ├── mtctp-index.json                   # mtctp索引
│   ├── mql4ea-index.json                  # mql4ea索引
│   ├── fxznjy-index.json                  # fxznjy索引
│   ├── forex-station-index.json            # forex-station索引
│   └── consolidated-index.json             # 统一索引
│
├── tools/                                  # 搜集工具
│   ├── github_collector.py                 # GitHub搜集脚本
│   ├── mql5_collector.py                  # MQL5 Code Base搜集脚本
│   ├── website_collector.py                # 通用网站搜集脚本
│   └── utils.py                           # 工具函数
│
└── logs/                                   # 搜集日志
    └── collection-log.md                    # 搜集过程日志
```

---

## Task 1: 初始化搜集基础设施

**Files:**
- Create: `source-collection/`
- Create: `source-collection/raw/`
- Create: `source-collection/raw/{github,mql5-codebase,mtctp,mql4ea,fxznjy,forex-station}/`
- Create: `source-collection/metadata/`
- Create: `source-collection/tools/`
- Create: `source-collection/logs/`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p source-collection/{raw/{github,mql5-codebase,mtctp,mql4ea,fxznjy,forex-station},metadata,tools,logs}
```

- [ ] **Step 2: Initialize metadata files**

```bash
# Create placeholder index files
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/github-repos.json
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/mql5-codebase-index.json
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/mtctp-index.json
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/mql4ea-index.json
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/fxznjy-index.json
echo '{"collected": [], "last_updated": null}' > source-collection/metadata/forex-station-index.json
```

- [ ] **Step 3: Create README for source collection**

```markdown
# MT4/MT5 开源源码搜集 - 原始资料库

此目录包含从各数据源搜集的原始源码，按来源分类存放。

## 目录结构

- `raw/` - 原始源码文件，按来源分类
- `metadata/` - 各来源的索引文件
- `tools/` - 搜集脚本工具
- `logs/` - 搜集过程日志

## 数据源

1. GitHub (github.com/topics/mql5)
2. MQL5 Code Base (mql5.com/zh/code)
3. mtctp.com
4. mql4ea.com
5. fxznjy.com
6. forex-station.com
```

- [ ] **Step 4: Commit**

```bash
git add source-collection/
git commit -m "feat: initialize source collection infrastructure"
```

---

## Task 2: GitHub源码搜集

**Files:**
- Create: `source-collection/tools/github_collector.py`
- Create: `source-collection/tools/utils.py`
- Create: `source-collection/tools/config.py`
- Modify: `source-collection/metadata/github-repos.json`

- [ ] **Step 1: Create config.py with required GitHub token**

```python
# source-collection/tools/config.py
"""
配置文件 - 包含所有采集器的配置
"""
import os

# GitHub配置 - 需要设置GITHUB_TOKEN环境变量
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN environment variable is required. Get one at https://github.com/settings/tokens")

# GitHub API限制
GITHUB_RATE_LIMIT_PER_HOUR = 5000  # 已认证用户

# 请求间隔（秒）- 避免触发速率限制
REQUEST_DELAY = 0.5

# 采集配置
MAX_REPOS_PER_QUERY = 1000  # GitHub搜索最多返回1000条
MAX_FILES_PER_REPO = 500     # 单仓库最大文件数
OUTPUT_BASE = Path("source-collection/raw")
```

- [ ] **Step 2: Create GitHub collector tool with pagination and download**

```python
# source-collection/tools/github_collector.py
"""
GitHub MT4/MT5 Source Code Collector
目标: 搜集所有GitHub上MQL4/MQL5相关仓库的源码和实际文件
"""

import requests
import json
import os
import time
from pathlib import Path
from utils import save_metadata, download_file, rate_limit_handler, paginate
from config import GITHUB_TOKEN, REQUEST_DELAY, OUTPUT_BASE

HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "MT4-MT5-Source-Collector",
    "Authorization": f"token {GITHUB_TOKEN}"
}

SEARCH_QUERIES = [
    "language:mql5 topic:expert-advisor",
    "language:mql5 topic:mt5",
    "language:mql4 topic:expert-advisor",
    "language:mql4 topic:mt4",
    "language:mql5",
]

def search_repos(query, per_page=100):
    """搜索GitHub仓库，支持分页"""
    url = "https://api.github.com/search/repositories"
    params = {"q": query, "per_page": per_page, "sort": "stars", "order": "desc"}
    all_items = []

    response = requests.get(url, headers=HEADERS, params=params)
    rate_limit_handler(response)

    if response.status_code == 200:
        data = response.json()
        all_items.extend(data.get("items", []))

        # 分页处理 - GitHub搜索最多1000条
        while 'next' in response.links and len(all_items) < 1000:
            response = requests.get(response.links['next']['url'], headers=HEADERS)
            rate_limit_handler(response)
            if response.status_code == 200:
                data = response.json()
                all_items.extend(data.get("items", []))
            else:
                break

    return {"items": all_items}

def get_repo_contents(owner, repo, path=""):
    """获取仓库文件列表"""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    response = requests.get(url, headers=HEADERS)
    rate_limit_handler(response)

    if response.status_code == 200:
        return response.json()
    return []

def download_mq_files(owner, repo, output_dir):
    """下载仓库中所有MQL文件"""
    downloaded = []
    repo_output = output_dir / f"{owner}_{repo}"
    repo_output.mkdir(parents=True, exist_ok=True)

    def recursive_download(path=""):
        contents = get_repo_contents(owner, repo, path)
        for item in contents:
            if item['type'] == 'file' and is_mq_file(item['name']):
                file_path = repo_output / item['name']
                if download_file(item.get('download_url'), file_path):
                    downloaded.append({
                        "name": item['name'],
                        "path": item['path'],
                        "local_path": str(file_path)
                    })
            elif item['type'] == 'dir' and len(downloaded) < 500:
                recursive_download(item['path'])

    recursive_download()
    return downloaded

def is_mq_file(filename):
    """判断是否为MQL源码文件"""
    return filename.endswith(('.mq4', '.mq5', '.mqh', '.ex4', '.ex5'))

def main():
    """主搜集流程"""
    all_repos = []
    output_dir = OUTPUT_BASE / "github"
    output_dir.mkdir(parents=True, exist_ok=True)

    for query in SEARCH_QUERIES:
        print(f"Searching: {query}")
        result = search_repos(query)

        for item in result.get("items", []):
            if any(r['repo'] == item['name'] for r in all_repos):
                continue

            owner = item['owner']['login']
            repo_name = item['name']
            print(f"  Collecting: {item['full_name']} (stars: {item['stargazers_count']})")

            # 下载源码文件
            downloaded_files = download_mq_files(owner, repo_name, output_dir)

            all_repos.append({
                "full_name": item['full_name'],
                "description": item.get('description'),
                "stars": item['stargazers_count'],
                "language": item.get('language'),
                "license": item.get('license', {}).get('spdx_id'),
                "homepage": item.get('homepage'),
                "files_downloaded": len(downloaded_files),
                "files": downloaded_files[:10]
            })

            time.sleep(REQUEST_DELAY)

    save_metadata("source-collection/metadata/github-repos.json", all_repos)
    print(f"Collected {len(all_repos)} repositories with source files")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Create utils.py with helper functions**

```python
# source-collection/tools/utils.py
"""
通用工具函数
"""

import json
import time
import requests
from pathlib import Path

def save_metadata(filepath, data):
    """保存元数据为JSON"""
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump({
            "collected": data,
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
        }, f, ensure_ascii=False, indent=2)

def load_metadata(filepath):
    """加载元数据"""
    if Path(filepath).exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"collected": [], "last_updated": None}

def rate_limit_handler(response):
    """处理GitHub API速率限制"""
    if response.status_code == 403:
        reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
        if reset_time:
            sleep_seconds = reset_time - time.time() + 5
            if sleep_seconds > 0:
                print(f"Rate limited. Waiting {sleep_seconds:.0f} seconds...")
                time.sleep(sleep_seconds)

def download_file(url, output_path):
    """下载文件"""
    if not url:
        return False

    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"Download failed: {e}")
    return False

def is_valid_mq_file(filename):
    """判断是否为有效的MQL文件"""
    valid_extensions = ('.mq4', '.mq5', '.mqh', '.ex4', '.ex5')
    return filename.endswith(valid_extensions)

def is_valid_mq_url(url):
    """判断URL是否为有效的MQL文件链接"""
    if not url:
        return False
    url_lower = url.lower()
    # 严格匹配：必须是文件扩展名
    return any(ext in url_lower for ext in ['.mq4', '.mq5', '.mqh', '.ex4', '.ex5'])
```

- [ ] **Step 3: Add pagination helper to utils.py**

```python
def paginate(url, headers, params=None, max_pages=10):
    """通用分页处理"""
    all_items = []
    page = 1

    while page <= max_pages:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            break

        data = response.json()
        items = data if isinstance(data, list) else data.get('items', [])
        all_items.extend(items)

        # 检查是否有下一页
        if 'next' in response.links:
            url = response.links['next']['url']
            page += 1
        else:
            break

    return all_items
```

- [ ] **Step 4: Run GitHub collector**

```bash
cd source-collection/tools
python github_collector.py
```

Expected output: "Collected N repositories with source files"

- [ ] **Step 5: Verify GitHub collection results**

```bash
# 检查搜集到的仓库数量
jq '.collected | length' source-collection/metadata/github-repos.json

# 检查下载的文件数量
jq '[.collected[] | select(.files_downloaded > 0)] | length' source-collection/metadata/github-repos.json
```

- [ ] **Step 6: Commit**

```bash
git add source-collection/
git commit -m "feat: add GitHub source collector with actual file download"
```

---

## Task 3: MQL5 Code Base搜集

**Files:**
- Create: `source-collection/tools/mql5_collector.py`
- Modify: `source-collection/metadata/mql5-codebase-index.json`

- [ ] **Step 1: Create MQL5 Code Base collector with download**

```python
# source-collection/tools/mql5_collector.py
"""
MQL5 Code Base (mql5.com/zh/code) 源码搜集器
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from pathlib import Path
from utils import save_metadata, is_valid_mq_file, is_valid_mq_url, download_file

BASE_URL = "https://www.mql5.com"
CODE_BASE_URL = f"{BASE_URL}/zh/code/mt5"

def get_page(url):
    """获取页面内容"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    response = requests.get(url, headers=headers, timeout=30)
    return BeautifulSoup(response.text, 'html.parser') if response.status_code == 200 else None

def parse_code_page(soup):
    """解析Code Base页面 - 使用多种选择器尝试"""
    items = []

    # 尝试多种选择器
    selectors = [
        '.code-header a[href*="/code/"]',
        '.article-code a[href*="/code/"]',
        'a[href*="/code/mt5/"]',
        '.mql5-code-item a',
        '.code-list a[href*="/code/"]',
    ]

    found_selectors = []
    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            found_selectors.append((selector, len(elements)))

    # 使用找到最多的选择器
    if found_selectors:
        best_selector, _ = max(found_selectors, key=lambda x: x[1])
        for item in soup.select(best_selector):
            url = item.get('href', '')
            title = item.get_text(strip=True) or item.get('title', '')

            if '/code/' in url and title:
                items.append({
                    "title": title,
                    "url": url if url.startswith('http') else BASE_URL + url,
                    "type": "ea" if "/expert" in url.lower() or ".ex5" in url.lower() else "indicator"
                })

    return items

def find_download_link(code_page_url):
    """从代码页面找到实际下载链接"""
    soup = get_page(code_page_url)
    if not soup:
        return None

    # 尝试多种下载链接模式
    download_patterns = [
        'a[href*="/download/"]',
        '.download-link a',
        'a[href*=".mq5"]',
        'a[href*=".mq4"]',
        'a[href*=".ex5"]',
    ]

    for pattern in download_patterns:
        link = soup.select_one(pattern)
        if link:
            href = link.get('href', '')
            if href and is_valid_mq_url(href):
                return href if href.startswith('http') else BASE_URL + href

    return None

def download_source(url, output_path):
    """下载源码文件"""
    # MQL5可能需要从页面提取下载链接
    if '/code/' in url:
        download_url = find_download_link(url)
        if download_url:
            return download_file(download_url, output_path)
    return False

def main():
    """主搜集流程"""
    all_items = []
    output_dir = Path("source-collection/raw/mql5-codebase")
    output_dir.mkdir(parents=True, exist_ok=True)

    page = 1
    max_pages = 50

    while page <= max_pages:
        url = f"{CODE_BASE_URL}?page={page}"
        print(f"Processing page {page}: {url}")

        soup = get_page(url)
        if not soup:
            print(f"  Failed to fetch page {page}")
            break

        items = parse_code_page(soup)
        if not items:
            print(f"  No items found on page {page}")
            break

        # 下载每个项目的源码
        for item in items:
            filename = re.sub(r'[^\w\-_\.]', '_', item['title'])[:100]
            ext = '.mq5' if item['type'] == 'ea' else '.mqh'
            output_path = output_dir / f"{filename}{ext}"

            if download_source(item['url'], output_path):
                item['downloaded'] = True
                item['local_path'] = str(output_path)
            else:
                item['downloaded'] = False

            time.sleep(0.5)

        all_items.extend(items)
        print(f"  Found {len(items)} items")

        page += 1
        time.sleep(1)

    save_metadata("source-collection/metadata/mql5-codebase-index.json", all_items)
    print(f"Collected {len(all_items)} items from MQL5 Code Base")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run MQL5 collector**

```bash
cd source-collection/tools
python mql5_collector.py
```

- [ ] **Step 3: Verify MQL5 collection**

```bash
jq '.collected | length' source-collection/metadata/mql5-codebase-index.json
```

- [ ] **Step 4: Commit**

```bash
git add source-collection/
git commit -m "feat: add MQL5 Code Base collector and index"
```

---

## Task 4: 中文网站搜集 (mtctp.com, mql4ea.com, fxznjy.com, forex-station.com)

**Files:**
- Create: `source-collection/tools/website_collector.py`
- Modify: `source-collection/metadata/{mtctp,mql4ea,fxznjy,forex-station}-index.json`

- [ ] **Step 1: Create generic website collector with strict URL filtering**

```python
# source-collection/tools/website_collector.py
"""
通用网站搜集器 - 用于mtctp, mql4ea, fxznjy, forex-station等
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from pathlib import Path
from utils import save_metadata, is_valid_mq_file, is_valid_mq_url, download_file

def create_collector(name, base_url, search_patterns, file_extensions=None):
    """
    创建网站搜集器

    Args:
        name: 网站名称
        base_url: 基础URL
        search_patterns: CSS选择器模式
        file_extensions: 要下载的文件扩展名列表
    """
    if file_extensions is None:
        file_extensions = ['.mq4', '.mq5', '.mqh', '.ex4', '.ex5']

    class WebsiteCollector:
        def __init__(self):
            self.name = name
            self.base_url = base_url
            self.patterns = search_patterns
            self.extensions = file_extensions

        def get_page(self, url):
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            try:
                response = requests.get(url, headers=headers, timeout=30)
                return BeautifulSoup(response.text, 'html.parser') if response.status_code == 200 else None
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                return None

        def is_valid_url(self, url):
            """严格验证URL是否为有效的MQL文件链接"""
            if not url:
                return False
            url_lower = url.lower()
            # 必须包含文件扩展名
            return any(ext in url_lower for ext in self.extensions)

        def extract_items(self, soup):
            """从页面提取项目"""
            items = []
            seen_urls = set()

            for pattern in self.patterns:
                for element in soup.select(pattern):
                    link = element if element.name == 'a' else element.select_one('a')
                    if link:
                        href = link.get('href', '')
                        title = link.get_text(strip=True)

                        # 严格过滤：必须是包含有效文件扩展名的URL
                        if self.is_valid_url(href) and href not in seen_urls:
                            seen_urls.add(href)
                            items.append({
                                "title": title or href.split('/')[-1],
                                "url": href if href.startswith('http') else self.base_url + href,
                                "source": self.name
                            })
            return items

        def collect_all(self, start_url, max_pages=20):
            """搜集所有页面"""
            all_items = []
            page = 1
            current_url = start_url

            while page <= max_pages:
                print(f"[{self.name}] Page {page}: {current_url}")
                soup = self.get_page(current_url)

                if not soup:
                    break

                items = self.extract_items(soup)
                if not items:
                    break

                all_items.extend(items)
                print(f"  Found {len(items)} items")

                # 查找下一页 - 多种模式
                next_link = None
                for selector in ['a.next', 'a[rel="next"]', '.pagination a.next',
                                 '.pager a.next', 'a.page-next']:
                    next_link = soup.select_one(selector)
                    if next_link:
                        break

                if next_link and next_link.get('href'):
                    current_url = next_link['href']
                    if not current_url.startswith('http'):
                        current_url = self.base_url + current_url
                else:
                    break

                page += 1
                time.sleep(2)

            return all_items

    return WebsiteCollector()

# 网站配置
WEBSITES = {
    "mtctp": {
        "base_url": "https://www.mtctp.com",
        "start_url": "https://www.mtctp.com/mql4/",
        "patterns": ["article a[href*='.mq'], article a[href*='download']",
                     ".post-title a[href*='.mq'], .entry-title a[href*='download']"],
        "extensions": ['.mq4', '.mq5', '.mqh', '.ex4', '.ex5']
    },
    "mql4ea": {
        "base_url": "https://www.mql4ea.com",
        "start_url": "https://www.mql4ea.com/ea/",
        "patterns": [".item-title a[href*='.mq'], .download a[href*='.mq']",
                     "article a[href*='download']"],
        "extensions": ['.mq4', '.mq5', '.mqh', '.ex4', '.ex5']
    },
    "fxznjy": {
        "base_url": "http://www.fxznjy.com",
        "start_url": "http://www.fxznjy.com/index.php",
        "patterns": ["a[href*='.mq4'], a[href*='.mq5'], a[href*='.ex4']"],
        "extensions": ['.mq4', '.mq5', '.ex4', '.ex5']
    },
    "forex-station": {
        "base_url": "https://www.forex-station.com",
        "start_url": "https://www.forex-station.com/dev/mql5.html",
        "patterns": ["a[href*='.mq5'], a[href*='_mq5']", ".code-link a"],
        "extensions": ['.mq5', '.mqh', '.ex5']
    }
}

def main():
    for site_name, config in WEBSITES.items():
        print(f"\n{'='*50}")
        print(f"Collecting from {site_name}")
        print(f"{'='*50}")

        collector = create_collector(
            site_name,
            config["base_url"],
            config["patterns"],
            config.get("extensions")
        )

        items = collector.collect_all(config["start_url"])

        metadata_file = f"source-collection/metadata/{site_name}-index.json"
        save_metadata(metadata_file, items)
        print(f"Collected {len(items)} items from {site_name}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run website collectors sequentially**

```bash
cd source-collection/tools
python website_collector.py
```

- [ ] **Step 3: Verify each collection**

```bash
for site in mtctp mql4ea fxznjy; do
    echo "$site: $(jq '.collected | length' source-collection/metadata/${site}-index.json) items"
done
```

- [ ] **Step 4: Commit**

```bash
git add source-collection/
git commit -m "feat: add Chinese website collectors (mtctp, mql4ea, fxznjy)"
```

---

---

## Task 5: forex-station.com搜集

> Task 5已合并到Task 4，forex-station的配置已添加到WEBSITES字典中

**Files:**
- Modify: `source-collection/metadata/forex-station-index.json`

- [ ] **Step 1: Run forex-station collector**

```bash
cd source-collection/tools
python website_collector.py
```

- [ ] **Step 2: Verify**

```bash
jq '.collected | length' source-collection/metadata/forex-station-index.json
```

- [ ] **Step 3: Commit**

```bash
git add source-collection/
git commit -m "feat: add forex-station collector"
```

---

## Task 6: 建立统一索引

**Files:**
- Create: `source-collection/metadata/consolidated-index.json`
- Create: `source-collection/metadata/summary.json`

- [ ] **Step 1: Create consolidation script with proper imports**

```python
# source-collection/tools/consolidate.py
"""
建立统一索引
"""

import json
from pathlib import Path
from datetime import datetime
from utils import load_metadata

def main():
    sources = [
        ("github", "github-repos.json"),
        ("mql5-codebase", "mql5-codebase-index.json"),
        ("mtctp", "mtctp-index.json"),
        ("mql4ea", "mql4ea-index.json"),
        ("fxznjy", "fxznjy-index.json"),
        ("forex-station", "forex-station-index.json"),
    ]

    consolidated = {
        "generated_at": datetime.now().isoformat(),
        "total_sources": len(sources),
        "sources": {},
        "all_items": []
    }

    for source_name, filename in sources:
        data = load_metadata(f"source-collection/metadata/{filename}")
        items = data.get("collected", [])

        consolidated["sources"][source_name] = {
            "count": len(items),
            "last_updated": data.get("last_updated"),
            "file": filename
        }

        # 标记来源
        for item in items:
            item["source"] = source_name
            consolidated["all_items"].append(item)

    # 去重（基于URL）
    seen_urls = set()
    unique_items = []
    for item in consolidated["all_items"]:
        url = item.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_items.append(item)

    consolidated["all_items"] = unique_items
    consolidated["total_unique"] = len(unique_items)

    # 保存
    with open("source-collection/metadata/consolidated-index.json", 'w', encoding='utf-8') as f:
        json.dump(consolidated, f, ensure_ascii=False, indent=2)

    # 生成摘要
    summary = {
        "generated_at": consolidated["generated_at"],
        "total_sources": consolidated["total_sources"],
        "total_unique_items": consolidated["total_unique"],
        "by_source": {k: v["count"] for k, v in consolidated["sources"].items()}
    }

    with open("source-collection/metadata/summary.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Consolidated: {consolidated['total_unique']} unique items from {len(sources)} sources")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run consolidation**

```bash
cd source-collection/tools
python consolidate.py
```

- [ ] **Step 3: Verify consolidated index**

```bash
echo "=== Collection Summary ==="
cat source-collection/metadata/summary.json | jq '.'

echo ""
echo "=== Source Breakdown ==="
cat source-collection/metadata/summary.json | jq '.by_source'
```

- [ ] **Step 4: Commit**

```bash
git add source-collection/
git commit -m "feat: add consolidated index and summary"
```

---

## Task 7: 收集过程日志

**Files:**
- Create: `source-collection/logs/collection-log.md`

- [ ] **Step 1: Create collection log template**

```markdown
# MT4/MT5 开源源码搜集日志

## 搜集记录

### GitHub
- 执行时间: [填写]
- 仓库数量: [填写]
- Star范围: [填写]
- 备注: [填写]

### MQL5 Code Base
- 执行时间: [填写]
- 采集页数: [填写]
- 备注: [填写]

### mtctp.com
- 执行时间: [填写]
- 采集项目数: [填写]
- 备注: [填写]

### mql4ea.com
- 执行时间: [填写]
- 采集项目数: [填写]
- 备注: [填写]

### fxznjy.com
- 执行时间: [填写]
- 采集项目数: [填写]
- 备注: [填写]

### forex-station.com
- 执行时间: [填写]
- 采集项目数: [填写]
- 备注: [填写]

## 问题记录

### 问题1: [描述]
- 发现时间:
- 影响:
- 解决方案:

### 问题2: [描述]
- 发现时间:
- 影响:
- 解决方案:

## 搜集结果摘要

| 数据源 | 数量 |
|--------|------|
| GitHub | - |
| MQL5 Code Base | - |
| mtctp.com | - |
| mql4ea.com | - |
| fxznjy.com | - |
| forex-station.com | - |
| **总计** | - |
```

- [ ] **Step 2: Commit**

```bash
git add source-collection/
git commit -m "docs: add collection log template"
```

---

## 最终验证

- [ ] **Verify all metadata files exist**

```bash
for f in github-repos mql5-codebase-index mtctp mql4ea fxznjy forex-station consolidated summary; do
    if [ ! -f "source-collection/metadata/${f}.json" ]; then
        echo "MISSING: ${f}.json"
    fi
done
echo "All metadata files present"
```

- [ ] **Verify directory structure**

```bash
find source-collection -type d | head -20
```

- [ ] **Final commit**

```bash
git add source-collection/
git commit -m "feat: complete Phase 1 source collection infrastructure"
```

---

## 预期产出

| 文件 | 说明 |
|------|------|
| `metadata/github-repos.json` | GitHub仓库索引 |
| `metadata/mql5-codebase-index.json` | MQL5 Code Base索引 |
| `metadata/{mtctp,mql4ea,fxznjy,forex-station}-index.json` | 各网站索引 |
| `metadata/consolidated-index.json` | 统一索引 |
| `metadata/summary.json` | 搜集摘要 |
| `tools/*.py` | 搜集工具 |
| `logs/collection-log.md` | 搜集日志 |

---

## 后续阶段

Phase 1 完成后，进入 Phase 2（筛选阶段）：
- 按标准筛选成色优秀的源代码
- 建立 approved/pending 分类
- 记录筛选决策

*Plan version: v1.1 - Fixed: actual file download, GitHub token required, pagination, strict URL filtering, forex-station merged*
