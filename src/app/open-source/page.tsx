// v22.0 Phase 7.23: 源码专区入口合并到大航海时代
// 列表页 /open-source → redirect /content (大航海时代)
// 详情页 /open-source/[slug] 仍保留 (大航海时代内的"开源资源详情")
// 下载 API /open-source/[slug]/download 仍保留
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function OpenSourcePage() {
  redirect("/content");
}
