"use client";

/**
 * EA可视化配置器 - Phase 2
 *
 * 功能：
 * - 左侧：模块库面板，点击添加模块到画布
 * - 中央：配置画布，支持拖拽调整模块位置
 * - 右侧：参数配置面板（选中模块后显示）
 * - 底部：执行链路预览
 */

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useModuleConfig } from "@/hooks/useModuleConfig";
import type { ModuleDefinition, ModuleConfig } from "@/types/config";
import {
  Activity, Zap, Rocket, Shield, TrendingUp, Layers, ShieldCheck,
  Package, Radio, Sliders, Play, Globe, Lock, GitFork, Cpu,
  Save, Trash2, GripVertical, X, Settings,
} from "lucide-react";

// ==================== 图标映射 ====================
const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity size={20} className="stroke-1.5 text-accent" />,
  Zap: <Zap size={20} className="stroke-1.5 text-accent" />,
  Rocket: <Rocket size={20} className="stroke-1.5 text-accent" />,
  Shield: <Shield size={20} className="stroke-1.5 text-accent" />,
  TrendingUp: <TrendingUp size={20} className="stroke-1.5 text-accent" />,
  Layers: <Layers size={20} className="stroke-1.5 text-accent" />,
  ShieldCheck: <ShieldCheck size={20} className="stroke-1.5 text-accent" />,
  Package: <Package size={20} className="stroke-1.5 text-accent" />,
  Radio: <Radio size={20} className="stroke-1.5 text-accent" />,
  Sliders: <Sliders size={20} className="stroke-1.5 text-accent" />,
  Play: <Play size={20} className="stroke-1.5 text-accent" />,
  Globe: <Globe size={20} className="stroke-1.5 text-accent" />,
  Lock: <Lock size={20} className="stroke-1.5 text-accent" />,
  GitFork: <GitFork size={20} className="stroke-1.5 text-accent" />,
  Cpu: <Cpu size={20} className="stroke-1.5 text-accent" />,
};

// ==================== 类别颜色 ====================
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

// ==================== 画布模块组件 ====================
function CanvasModule({
  module,
  isSelected,
  onSelect,
  onRemove,
}: {
  module: ModuleConfig;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{ left: module.position.x, top: module.position.y }}
      className={`absolute w-48 rounded-xl bg-card border transition-all ${
        isSelected ? "border-accent shadow-lg shadow-accent/20" : "border-border/50 hover:border-accent/50"
      }`}
    >
      {/* 卡片主体 - 点击选中 */}
      <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-3 cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center">
            {iconMap[module.icon] || <Cpu size={16} className="stroke-1.5 text-accent" />}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <div className="text-sm font-medium mb-1 truncate">{module.displayName}</div>
        <Badge variant="outline" className={`${categoryColors[module.category]} text-[9px] border`}>
          {module.category}
        </Badge>
      </div>
      {/* grip图标 - 拖拽手柄 */}
      <div
        data-module-id={module.id}
        data-drag-handle="true"
        className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center cursor-grab"
      >
        <GripVertical size={14} className="text-muted-foreground/50" />
      </div>
    </div>
  );
}

// ==================== 参数配置面板 ====================
function ParameterPanel({
  module,
  moduleDefinition,
  onUpdateParam,
  onClose,
}: {
  module: ModuleConfig;
  moduleDefinition?: ModuleDefinition;
  onUpdateParam: (name: string, value: string | number | boolean) => void;
  onClose: () => void;
}) {
  // 获取参数的中文显示信息
  const getParamInfo = (paramName: string) => {
    if (!moduleDefinition) {
      return { displayName: paramName, description: "", type: "string" as const, options: undefined };
    }
    const param = moduleDefinition.parameters.find((p) => p.name === paramName);
    return {
      displayName: param?.displayName || paramName,
      description: param?.description || "",
      type: param?.type || "string",
      options: param?.options,
    };
  };

  // 格式化显示值
  const formatValue = (value: string | number | boolean, paramName: string): string => {
    const { type } = getParamInfo(paramName);
    if (type === "boolean") {
      return value ? "是" : "否";
    }
    return String(value);
  };

  return (
    <div className="w-80 border-l border-border/50 bg-card/50 h-full overflow-y-auto">
      {/* 面板头部 */}
      <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/50 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-accent" />
          <span className="font-medium">{module.displayName}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground">
          <X size={14} />
        </button>
      </div>
      {/* 参数列表 */}
      <div className="p-4 space-y-4">
        {Object.entries(module.parameters).map(([key, value]) => {
          const { displayName, description, type, options } = getParamInfo(key);
          return (
            <div key={key} className="space-y-1.5">
              {/* 参数中文名称 */}
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {displayName}
              </label>
              {/* 参数描述 */}
              {description && (
                <p className="text-[10px] text-muted-foreground/70">{description}</p>
              )}
              {/* 根据参数类型渲染不同输入控件 */}
              {type === "select" && options ? (
                /* 下拉选择框 */
                <select
                  value={String(value)}
                  onChange={(e) => onUpdateParam(key, e.target.value)}
                  className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : type === "boolean" ? (
                /* 布尔类型切换 */
                <select
                  value={value ? "true" : "false"}
                  onChange={(e) => onUpdateParam(key, e.target.value === "true")}
                  className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm"
                >
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              ) : (
                /* 文本/数字输入框 */
                <Input
                  value={formatValue(value, key)}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (type === "int" || type === "float") {
                      onUpdateParam(key, Number(v));
                    } else {
                      onUpdateParam(key, v);
                    }
                  }}
                  className="h-8 text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 执行链路预览 ====================
function FlowPreview({ modules }: { modules: ModuleConfig[] }) {
  const order = ["signal", "filter", "execution", "trailing", "breakeven", "risk", "multi", "copytrade"];
  const sorted = [...modules].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  if (sorted.length === 0) return null;

  return (
    <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">执行链路：</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sorted.map((mod, i) => (
            <div key={mod.id} className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${categoryColors[mod.category]} border`}>
                {mod.displayName}
              </div>
              {i < sorted.length - 1 && (
                <span className="text-muted-foreground text-sm">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ====================
export default function BuilderPage() {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    moduleId: string;
    startX: number;
    startY: number;
    moduleStartX: number;
    moduleStartY: number;
  } | null>(null);

  const {
    config,
    selectedModuleId,
    selectedModule,
    setSelectedModuleId,
    addModule,
    removeModule,
    updateModulePosition,
    updateModuleParameter,
    clearConfig,
    setConfigName,
  } = useModuleConfig();

  // 加载模块列表
  useEffect(() => {
    fetch("/api/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModules(data.data.map((m: Record<string, unknown>) => ({
            ...m,
            parameters: JSON.parse(m.parameters as string || "[]"),
          })));
        }
      });
  }, []);

  // 获取选中模块的完整定义
  const selectedModuleDefinition = modules.find((m) => m.id === selectedModule?.moduleId);

  // ==================== 拖拽处理 ====================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const dragHandle = target.closest("[data-drag-handle]");
    if (!dragHandle) return;

    const moduleId = dragHandle.getAttribute("data-module-id");
    if (!moduleId) return;

    const module = config.modules.find((m) => m.id === moduleId);
    if (!module) return;

    e.preventDefault();
    e.stopPropagation();

    setDragging({
      moduleId,
      startX: e.clientX,
      startY: e.clientY,
      moduleStartX: module.position.x,
      moduleStartY: module.position.y,
    });
  }, [config.modules]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    updateModulePosition(dragging.moduleId, {
      x: dragging.moduleStartX + dx,
      y: dragging.moduleStartY + dy,
    });
  }, [dragging, updateModulePosition]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // 添加模块
  const handleAddModule = (module: ModuleDefinition) => {
    const defaultParams: Record<string, string | number | boolean> = {};
    module.parameters.forEach((p) => {
      if (p.type === "boolean") defaultParams[p.name] = p.default === "true";
      else if (p.type === "int" || p.type === "float") defaultParams[p.name] = Number(p.default);
      else defaultParams[p.name] = p.default;
    });
    addModule({
      moduleId: module.id,
      displayName: module.displayName,
      category: module.category,
      icon: module.icon,
      parameters: defaultParams,
    });
  };

  // 保存配置
  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus(null);

    try {
      // 构造保存数据
      const saveData = {
        name: config.name || "未命名配置",
        description: config.description || "",
        modules: config.modules.map((m) => ({
          moduleId: m.moduleId,
          parameters: m.parameters,
        })),
      };

      console.log("保存数据:", JSON.stringify(saveData, null, 2));

      const response = await fetch("/api/eaconfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });

      const data = await response.json();
      console.log("保存响应:", data);

      if (data.success) {
        setSaveStatus("保存成功！");
      } else {
        setSaveStatus(`保存失败: ${data.error || "未知错误"}`);
      }
    } catch (err) {
      console.error("保存错误:", err);
      setSaveStatus("保存失败: 网络错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex ambient-glow">
      {/* 背景渐变和网格 */}
      <div className="fixed top-0 right-0 w-[70%] h-full bg-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <Sidebar />

      <div className="flex-1 relative z-10 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Cpu size={18} className="stroke-1.5 text-accent" />
                </div>
                <h1 className="text-xl font-bold">EA配置器</h1>
              </div>
              <Input
                value={config.name}
                onChange={(e) => setConfigName(e.target.value)}
                className="w-64 h-8 text-sm"
                placeholder="配置名称"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{config.modules.length} 个模块</Badge>
              {saveStatus && (
                <Badge variant={saveStatus.includes("成功") ? "default" : "destructive"} className="text-xs">
                  {saveStatus}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearConfig} className="h-8 text-xs">
                <Trash2 size={14} className="mr-1" />清空
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading || config.modules.length === 0} className="h-8 text-xs">
                <Save size={14} className="mr-1" />{isLoading ? "保存中..." : "保存配置"}
              </Button>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧模块库 */}
          <div className="w-64 border-r border-border/50 bg-card/30 overflow-y-auto">
            <div className="p-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">模块库</div>
              <div className="space-y-2">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => handleAddModule(mod)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-card/80 border border-border/50 cursor-pointer transition-all hover:border-accent/30"
                  >
                    <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
                      {iconMap[mod.icon] || <Cpu size={18} className="stroke-1.5 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{mod.displayName}</div>
                      <div className="text-xs text-muted-foreground">{mod.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 中央画布 */}
          <div
            className="flex-1 relative overflow-auto bg-gradient-to-br from-background to-muted/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedModuleId(null)}
          >
            {config.modules.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Cpu size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">点击左侧模块添加到画布</p>
                  <p className="text-xs mt-1">拖拽模块可调整位置</p>
                </div>
              </div>
            ) : (
              config.modules.map((mod) => (
                <CanvasModule
                  key={mod.id}
                  module={mod}
                  isSelected={mod.id === selectedModuleId}
                  onSelect={() => setSelectedModuleId(mod.id)}
                  onRemove={() => removeModule(mod.id)}
                />
              ))
            )}
          </div>

          {/* 右侧参数面板 */}
          {selectedModule && (
            <ParameterPanel
              module={selectedModule}
              moduleDefinition={selectedModuleDefinition}
              onUpdateParam={(name, value) => updateModuleParameter(selectedModule.id, name, value)}
              onClose={() => setSelectedModuleId(null)}
            />
          )}
        </div>

        {/* 底部执行链路预览 */}
        <FlowPreview modules={config.modules} />
      </div>
    </div>
  );
}
