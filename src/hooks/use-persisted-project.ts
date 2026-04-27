'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type Project,
  type SubPiece,
  type ProjectParams,
  getDefaultProject,
} from '@/lib/types';

const STORAGE_KEY = 'dcalc_project';
const VERSION_KEY = 'dcalc_version';
const CURRENT_VERSION = '8'; // Bumped from 7 to force migration
const DEBOUNCE_MS = 500;

/**
 * Migrate old project data to include new fields like extraExpenses, bufferFactor, etc.
 */
function migrateProject(parsed: unknown): Project {
  const proj = parsed as Project;

  // Ensure params has all new fields
  const defaultParams = getDefaultProject().params;
  const params: ProjectParams = {
    ...defaultParams,
    ...proj.params,
    extraExpenses: proj.params.extraExpenses || [],
    bufferFactor: proj.params.bufferFactor ?? 1.0,
    dailyUsageHours: proj.params.dailyUsageHours ?? 8,
    amortizationMonths: proj.params.amortizationMonths ?? 30,
    monthlyMaintenanceCost: proj.params.monthlyMaintenanceCost ?? 0,
    additionalInitialCost: proj.params.additionalInitialCost ?? 0,
    commissionPercentage: proj.params.commissionPercentage ?? 0,
    commissionFixed: proj.params.commissionFixed ?? 0,
    priceRounding: proj.params.priceRounding ?? 'none',
    minimumOrderPrice: proj.params.minimumOrderPrice ?? 0,
    printerProfileId: proj.params.printerProfileId ?? 'custom',
    monthlyExpenses: (proj.params as ProjectParams & { monthlyExpenses?: unknown }).monthlyExpenses || [],
  };

  // Ensure subPieces have all new fields
  const defaultSubPiece = getDefaultProject().subPieces[0];
  const subPieces: SubPiece[] = (proj.subPieces || []).map((sp: Partial<SubPiece>) => {
    // Migrate old postProcessType to new postProcesses array
    const oldSp = sp as SubPiece & { 
      postProcessType?: string; 
      postProcessingTimeMinutes?: number; 
      postProcessRatePerHour?: number;
      finishingType?: string;
      finishingCostPerPiece?: number;
      customFinishingDescription?: string;
    };
    let postProcesses = (sp as SubPiece).postProcesses || [];
    if (postProcesses.length === 0 && oldSp.postProcessType && oldSp.postProcessType !== 'none' && oldSp.postProcessingTimeMinutes && oldSp.postProcessingTimeMinutes > 0) {
      postProcesses = [{
        id: `pp_migrated_${Date.now()}`,
        name: oldSp.postProcessType,
        timeMinutes: oldSp.postProcessingTimeMinutes || 0,
        ratePerHour: oldSp.postProcessRatePerHour || 15,
      }];
    }
    return {
      ...defaultSubPiece,
      ...sp,
      postProcesses,
      extraExpenses: (sp as SubPiece).extraExpenses || [],
      designTimeMinutes: (sp as SubPiece).designTimeMinutes ?? 0,
      designHourlyRate: (sp as SubPiece).designHourlyRate ?? 25,
      customFilamentName: (sp as SubPiece).customFilamentName ?? '',
      color: (sp as SubPiece).color ?? '#C77D3A',
    };
  });

  return {
    ...getDefaultProject(),
    ...proj,
    params,
    subPieces,
    currency: proj.currency || 'EUR',
    locale: proj.locale || 'es',
  };
}

function readFromStorage(): Project | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Basic shape validation
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'name' in parsed &&
      'subPieces' in parsed &&
      'params' in parsed &&
      Array.isArray((parsed as Project).subPieces)
    ) {
      // Migrate old data to include new fields
      return migrateProject(parsed);
    }

    // Corrupted data — clean up
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    return null;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage might be full or unavailable
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
    // Storage full or unavailable
  }
}

export function usePersistedProject(): {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  resetProject: () => void;
  hasStoredData: boolean;
} {
  const [project, setProject] = useState<Project>(() => {
    // SSR guard
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

  // Keep ref in sync with state
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
