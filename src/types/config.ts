// Module configuration types for the visual EA builder

export interface ModuleParameter {
  name: string;
  displayName: string;
  type: "string" | "int" | "float" | "boolean" | "select";
  default: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  icon: string;
  isRunnable: boolean;
  requiresMT5: boolean;
  parameters: ModuleParameter[];
  dependencies: string[];
}

export interface ModuleConfig {
  id: string; // Client-generated unique ID
  moduleId: string; // Database Module.id
  displayName: string;
  category: string;
  icon: string;
  parameters: Record<string, string | number | boolean>;
  position: { x: number; y: number };
}

export interface Connection {
  id: string;
  fromModuleId: string;
  toModuleId: string;
}

export interface EAConfigState {
  id?: string;
  name: string;
  description: string;
  modules: ModuleConfig[];
  connections: Connection[];
}

export const CATEGORY_ORDER = [
  "signal",
  "filter",
  "execution",
  "trailing",
  "breakeven",
  "risk",
  "multi",
  "copytrade",
  "registry",
  "utility",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
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
