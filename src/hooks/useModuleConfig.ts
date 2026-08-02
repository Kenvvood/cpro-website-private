"use client";

import { useState, useCallback } from "react";
import type { ModuleConfig, Connection, EAConfigState } from "@/types/config";

export function useModuleConfig() {
  const [config, setConfig] = useState<EAConfigState>({
    name: "我的EA配置",
    description: "",
    modules: [],
    connections: [],
  });

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const addModule = useCallback(
    (module: Omit<ModuleConfig, "id" | "position">) => {
      const newModule: ModuleConfig = {
        ...module,
        id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 100 },
      };

      setConfig((prev) => ({
        ...prev,
        modules: [...prev.modules, newModule],
      }));

      return newModule.id;
    },
    []
  );

  const removeModule = useCallback((moduleId: string) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
      connections: prev.connections.filter(
        (c) => c.fromModuleId !== moduleId && c.toModuleId !== moduleId
      ),
    }));
    setSelectedModuleId((prev) => (prev === moduleId ? null : prev));
  }, []);

  const updateModulePosition = useCallback(
    (moduleId: string, position: { x: number; y: number }) => {
      setConfig((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, position } : m
        ),
      }));
    },
    []
  );

  const updateModuleParameter = useCallback(
    (moduleId: string, paramName: string, value: string | number | boolean) => {
      setConfig((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? { ...m, parameters: { ...m.parameters, [paramName]: value } }
            : m
        ),
      }));
    },
    []
  );

  const addConnection = useCallback(
    (fromModuleId: string, toModuleId: string) => {
      // Avoid duplicate connections
      const exists = config.connections.some(
        (c) =>
          c.fromModuleId === fromModuleId && c.toModuleId === toModuleId
      );
      if (exists || fromModuleId === toModuleId) return;

      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        fromModuleId,
        toModuleId,
      };

      setConfig((prev) => ({
        ...prev,
        connections: [...prev.connections, newConnection],
      }));
    },
    [config.connections]
  );

  const removeConnection = useCallback((connectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
    }));
  }, []);

  const selectedModule = config.modules.find((m) => m.id === selectedModuleId) || null;

  const clearConfig = useCallback(() => {
    setConfig({
      name: "我的EA配置",
      description: "",
      modules: [],
      connections: [],
    });
    setSelectedModuleId(null);
  }, []);

  return {
    config,
    selectedModuleId,
    selectedModule,
    setSelectedModuleId,
    addModule,
    removeModule,
    updateModulePosition,
    updateModuleParameter,
    addConnection,
    removeConnection,
    clearConfig,
    setConfigName: (name: string) =>
      setConfig((prev) => ({ ...prev, name })),
    setConfigDescription: (description: string) =>
      setConfig((prev) => ({ ...prev, description })),
  };
}
