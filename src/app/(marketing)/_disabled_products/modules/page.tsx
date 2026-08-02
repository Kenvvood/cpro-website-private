import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  Zap,
  Rocket,
  Shield,
  TrendingUp,
  Layers,
  ShieldCheck,
  Package,
  Radio,
  Sliders,
  Play,
  Globe,
  Lock,
  GitFork,
  Cpu,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity size={24} className="stroke-1.5 text-accent" />,
  Zap: <Zap size={24} className="stroke-1.5 text-accent" />,
  Rocket: <Rocket size={24} className="stroke-1.5 text-accent" />,
  Shield: <Shield size={24} className="stroke-1.5 text-accent" />,
  TrendingUp: <TrendingUp size={24} className="stroke-1.5 text-accent" />,
  Layers: <Layers size={24} className="stroke-1.5 text-accent" />,
  ShieldCheck: <ShieldCheck size={24} className="stroke-1.5 text-accent" />,
  Package: <Package size={24} className="stroke-1.5 text-accent" />,
  Radio: <Radio size={24} className="stroke-1.5 text-accent" />,
  Sliders: <Sliders size={24} className="stroke-1.5 text-accent" />,
  Play: <Play size={24} className="stroke-1.5 text-accent" />,
  Globe: <Globe size={24} className="stroke-1.5 text-accent" />,
  Lock: <Lock size={24} className="stroke-1.5 text-accent" />,
  GitFork: <GitFork size={24} className="stroke-1.5 text-accent" />,
  Cpu: <Cpu size={24} className="stroke-1.5 text-accent" />,
};

const categoryLabels: Record<string, string> = {
  signal: "信号模块",
  execution: "执行模块",
  risk: "风控模块",
  trailing: "追踪止损",
  breakeven: "保本模块",
  filter: "过滤器",
  multi: "多仓位",
  copytrade: "跟单模块",
  registry: "注册表",
  utility: "工具",
};

const categoryColors: Record<string, string> = {
  signal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  execution: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  risk: "bg-red-500/20 text-red-400 border-red-500/30",
  trailing: "bg-green-500/20 text-green-400 border-green-500/30",
  breakeven: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  filter: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  multi: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  copytrade: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  registry: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  utility: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

async function getModules() {
  const modules = await prisma.module.findMany({
    orderBy: { createdAt: "desc" },
  });
  return modules;
}

export default async function ModulesPage() {
  const modules = await getModules();

  return (
    <div className="min-h-screen flex ambient-glow">
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10">
        {/* Page Header */}
        <div className="px-20 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Cpu size={22} className="stroke-1.5 text-accent" />
            </div>
            <h1 className="text-3xl font-bold">模块积木</h1>
          </div>
          <p className="text-sm text-text-secondary">
            拖拽组合MQL5模块，像搭积木一样搭建专属EA交易系统
          </p>
        </div>

        {/* Stats */}
        <div className="px-20 mb-8">
          <div className="flex gap-6">
            <div className="bg-card/50 rounded-lg px-4 py-2 border border-border/50">
              <div className="text-2xl font-bold text-accent">{modules.length}</div>
              <div className="text-xs text-muted-foreground">可用模块</div>
            </div>
            <div className="bg-card/50 rounded-lg px-4 py-2 border border-border/50">
              <div className="text-2xl font-bold text-accent">
                {modules.filter((m: { isRunnable: boolean }) => m.isRunnable).length}
              </div>
              <div className="text-xs text-muted-foreground">可在线运行</div>
            </div>
            <div className="bg-card/50 rounded-lg px-4 py-2 border border-border/50">
              <div className="text-2xl font-bold text-accent">
                {Object.keys(categoryLabels).length}
              </div>
              <div className="text-xs text-muted-foreground">模块类别</div>
            </div>
          </div>
        </div>

        {/* Category Filters Info */}
        <div className="px-20 mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Badge
                key={key}
                variant="outline"
                className={`${categoryColors[key]} border`}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <section className="px-20 py-6">
          <div className="grid grid-cols-3 gap-5">
            {modules.map((mod: Record<string, any>) => {
              const params = mod.parameters ? JSON.parse(mod.parameters) : [];
              return (
                <Card key={mod.id} className="group hover:border-accent/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                        {iconMap[mod.icon || "Cpu"] || <Cpu size={24} className="stroke-1.5 text-accent" />}
                      </div>
                      <Badge
                        variant="outline"
                        className={`${categoryColors[mod.category] || categoryColors.utility} text-[10px]`}
                      >
                        {categoryLabels[mod.category] || mod.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{mod.displayName}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>v{mod.version}</span>
                        <span className="text-border/50">|</span>
                        <span>{params.length}个参数</span>
                        {mod.requiresMT5 && (
                          <>
                            <span className="text-border/50">|</span>
                            <span className="text-orange-400">需MT5</span>
                          </>
                        )}
                      </div>
                      {/* Tags */}
                      <div className="flex gap-2 flex-wrap">
                        {mod.isRunnable && (
                          <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                            可运行
                          </Badge>
                        )}
                        {params.slice(0, 2).map((param: { name: string }) => (
                          <Badge key={param.name} variant="outline" className="text-[10px]">
                            {param.name}
                          </Badge>
                        ))}
                        {params.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{params.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
