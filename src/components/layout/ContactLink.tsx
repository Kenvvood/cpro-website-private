// v22.0 BATCH 25: Footer 联系客服链接 (Client 组件, 触发埋点)
//  - 拆出独立 client 组件, 让 footer.tsx 保持 server component (SEO + 性能)
//  - onClick 触发 track.contactSupport (channel: wechat / qq / phone)
"use client";

import { track } from "@/lib/analytics";

interface Props {
  href: string;
  label: string;
  value: string;
  channel: "wechat" | "qq" | "phone" | "email";
  icon: React.ReactNode;
}

export function ContactLink({ href, label, value, channel, icon }: Props) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "nofollow noopener" : undefined}
      onClick={() => track.contactSupport(channel)}
      className="flex items-center gap-2 hover:text-white transition-colors w-fit"
    >
      {icon}
      <span className="font-semibold shrink-0">{label}:</span>
      <span className="num truncate">{value}</span>
    </a>
  );
}
