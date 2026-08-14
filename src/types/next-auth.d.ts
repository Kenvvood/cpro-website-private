// /types/next-auth.d.ts — NextAuth Session 类型扩展
// 项目用了 session.user.id / .username / .role / .memberLevel
// 默认 next-auth Session 只有 name/email/image

import { DefaultSession } from 'next-auth';
import { UserRole } from '@/generated/prisma/enums';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string;
      phone?: string | null;
      role?: UserRole;
      memberLevel?: string;
      wechatOpenid?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username?: string;
    phone?: string | null;
    role?: UserRole;
    memberLevel?: string;
    wechatOpenid?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    phone?: string | null;
    role?: UserRole;
    memberLevel?: string;
    wechatOpenid?: string | null;
  }
}
