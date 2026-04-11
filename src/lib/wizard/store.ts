'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
} from 'react';
import React from 'react';

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  petName: string;
  petPersonality: string;
  petImage: File | null;
  petImagePreview: string | null;
  hasHuman: boolean;
  humanIsMinor: boolean | null;
  humanDescription: string | null;
  humanHairColor: string | null;
  humanClothing: string | null;
  humanPersonality: string | null;
  humanImage: File | null;
  humanImagePreview: string | null;
  humanTermsAccepted: boolean;
  theme: string;
  artStyle: string;
}

export type WizardAction =
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 | 4 | 5 }
  | {
      type: 'SET_PET_DATA';
      payload: { petName?: string; petPersonality?: string };
    }
  | {
      type: 'SET_PET_IMAGE';
      payload: { petImage: File | null; petImagePreview: string | null };
    }
  | {
      type: 'SET_HUMAN_DATA';
      payload: {
        hasHuman?: boolean;
        humanIsMinor?: boolean | null;
        humanDescription?: string | null;
        humanHairColor?: string | null;
        humanClothing?: string | null;
        humanPersonality?: string | null;
        humanTermsAccepted?: boolean;
      };
    }
  | {
      type: 'SET_HUMAN_IMAGE';
      payload: { humanImage: File | null; humanImagePreview: string | null };
    }
  | {
      type: 'SET_THEME_DATA';
      payload: { theme?: string; artStyle?: string };
    }
  | { type: 'RESET' };

const initialState: WizardState = {
  currentStep: 1,
  petName: '',
  petPersonality: '',
  petImage: null,
  petImagePreview: null,
  hasHuman: false,
  humanIsMinor: null,
  humanDescription: null,
  humanHairColor: null,
  humanClothing: null,
  humanPersonality: null,
  humanImage: null,
  humanImagePreview: null,
  humanTermsAccepted: false,
  theme: '',
  artStyle: '',
};

const STORAGE_KEY = 'waggingtails_wizard';

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PET_DATA':
      return { ...state, ...action.payload };
    case 'SET_PET_IMAGE':
      return {
        ...state,
        petImage: action.payload.petImage,
        petImagePreview: action.payload.petImagePreview,
      };
    case 'SET_HUMAN_DATA':
      return { ...state, ...action.payload };
    case 'SET_HUMAN_IMAGE':
      return {
        ...state,
        humanImage: action.payload.humanImage,
        humanImagePreview: action.payload.humanImagePreview,
      };
    case 'SET_THEME_DATA':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

function saveToLocalStorage(state: WizardState) {
  try {
    const serializable = {
      ...state,
      petImage: null,
      humanImage: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage may be full or unavailable
  }
}

function loadFromLocalStorage(): Partial<WizardState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage();
    if (stored) {
      if (stored.petName !== undefined || stored.petPersonality !== undefined) {
        dispatch({
          type: 'SET_PET_DATA',
          payload: {
            petName: stored.petName,
            petPersonality: stored.petPersonality,
          },
        });
      }
      if (stored.petImagePreview) {
        dispatch({
          type: 'SET_PET_IMAGE',
          payload: { petImage: null, petImagePreview: stored.petImagePreview },
        });
      }
      if (stored.hasHuman !== undefined) {
        dispatch({
          type: 'SET_HUMAN_DATA',
          payload: {
            hasHuman: stored.hasHuman,
            humanIsMinor: stored.humanIsMinor,
            humanDescription: stored.humanDescription,
            humanHairColor: stored.humanHairColor,
            humanClothing: stored.humanClothing,
            humanPersonality: stored.humanPersonality,
            humanTermsAccepted: stored.humanTermsAccepted,
          },
        });
      }
      if (stored.humanImagePreview) {
        dispatch({
          type: 'SET_HUMAN_IMAGE',
          payload: {
            humanImage: null,
            humanImagePreview: stored.humanImagePreview,
          },
        });
      }
      if (stored.theme || stored.artStyle) {
        dispatch({
          type: 'SET_THEME_DATA',
          payload: { theme: stored.theme, artStyle: stored.artStyle },
        });
      }
      if (stored.currentStep) {
        dispatch({ type: 'SET_STEP', payload: stored.currentStep });
      }
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveToLocalStorage(state);
    }
  }, [state, hydrated]);

  const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  if (!hydrated) {
    return null;
  }

  return React.createElement(WizardContext.Provider, { value }, children);
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
