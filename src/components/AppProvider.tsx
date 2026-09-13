"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import type { AppConfig } from "@/lib/config/types";
import type { Project } from "@/lib/projects/types";
import { brand } from "@/lib/brand";

type AppState = {
  brandName: string;
  config: AppConfig | null;
  projects: Project[];
  projectId: string | null;
  loading: boolean;
  error: string | null;
  offline: boolean;
  setProjectId: (id: string | null) => void;
  refresh: () => Promise<void>;
  saveConfig: (config: AppConfig) => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfgRes, projRes] = await Promise.all([fetch("/api/config"), fetch("/api/projects")]);
      if (!cfgRes.ok || !projRes.ok) throw new Error("No se pudo cargar el estado.");
      const cfgJson = await cfgRes.json();
      const projJson = await projRes.json();
      setConfig(cfgJson.config);
      setProjects(projJson.projects);
      setOffline(false);
      const stored = typeof window !== "undefined" ? localStorage.getItem("companero.projectId") : null;
      setProjectIdState((current) => {
        if (current && projJson.projects.some((p: Project) => p.id === current)) return current;
        if (stored && projJson.projects.some((p: Project) => p.id === stored)) return stored;
        return projJson.projects.find((p: Project) => p.status === "activo")?.id ?? null;
      });
    } catch (err) {
      setOffline(true);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setProjectId = (id: string | null) => {
    setProjectIdState(id);
    if (id) localStorage.setItem("companero.projectId", id);
    else localStorage.removeItem("companero.projectId");
  };

  const saveConfig = async (next: AppConfig) => {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) throw new Error("No se pudo guardar la configuración");
    const json = await res.json();
    startTransition(() => setConfig(json.config));
  };

  const value = useMemo(
    () => ({
      brandName: brand.shortName,
      config,
      projects,
      projectId,
      loading,
      error,
      offline,
      setProjectId,
      refresh,
      saveConfig,
    }),
    [config, projects, projectId, loading, error, offline, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState fuera de AppProvider");
  return ctx;
}
