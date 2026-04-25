'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type Project,
  getDefaultProject,
} from '@/lib/types';

const STORAGE_KEY = 'dcalc_project';
const VERSION_KEY = 'dcalc_version';
const CURRENT_VERSION = '5';
const DEBOUNCE_MS = 500;

function readFromStorage(): Project | null {
  if (typeof window === 'undefined') return null;

  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      // Old or missing version — invalidate stored data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VERSION_KEY);
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Basic shape validation — ensure it looks like a Project object
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'name' in parsed &&
      'subPieces' in parsed &&
      'params' in parsed &&
      Array.isArray((parsed as Project).subPieces)
    ) {
      return parsed as Project;
    }

    // Corrupted data — clean up
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    // Corrupted JSON or any other error — clean up
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage might be full or unavailable — silently ignore
    }
    return null;
  }
}

function writeToStorage(project: Project): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function usePersistedProject(): {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  resetProject: () => void;
  hasStoredData: boolean;
} {
  const [project, setProject] = useState<Project>(() => {
    // SSR guard — return default on the server
    if (typeof window === 'undefined') return getDefaultProject();

    const stored = readFromStorage();
    return stored ?? getDefaultProject();
  });

  const [hasStoredData, setHasStoredData] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return readFromStorage() !== null;
  });

  // Ref to hold the latest project for the debounce callback
  const projectRef = useRef(project);

  // Keep ref in sync with state inside an effect
  useEffect(() => {
    projectRef.current = project;
  });

  // Debounced write to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      writeToStorage(projectRef.current);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [project]);

  const resetProject = useCallback(() => {
    const fresh = getDefaultProject();
    setProject(fresh);
    writeToStorage(fresh);
    setHasStoredData(false);
  }, []);

  return { project, setProject, resetProject, hasStoredData };
}
