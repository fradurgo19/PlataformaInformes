import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Report, Component, Part } from '../types';

interface ReportState {
  currentReport: Partial<Report> | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

type ReportAction =
  | { type: 'SET_CURRENT_REPORT'; payload: Partial<Report> }
  | { type: 'UPDATE_REPORT_FIELD'; payload: { field: keyof Report; value: any } }
  | { type: 'ADD_COMPONENT'; payload: Component }
  | { type: 'UPDATE_COMPONENT'; payload: { index: number; component: Component } }
  | { type: 'REMOVE_COMPONENT'; payload: number }
  | { type: 'ADD_PART'; payload: Part }
  | { type: 'UPDATE_PART'; payload: { index: number; part: Part } }
  | { type: 'REMOVE_PART'; payload: number }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CURRENT_REPORT' };

const initialState: ReportState = {
  currentReport: null,
  reports: [],
  isLoading: false,
  error: null,
};

const reportReducer = (state: ReportState, action: ReportAction): ReportState => {
  switch (action.type) {
    case 'SET_CURRENT_REPORT':
      return { ...state, currentReport: action.payload };
    case 'UPDATE_REPORT_FIELD':
      return {
        ...state,
        currentReport: state.currentReport
          ? { ...state.currentReport, [action.payload.field]: action.payload.value }
          : null,
      };
    case 'ADD_COMPONENT':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              components: [...(state.currentReport.components || []), action.payload],
            }
          : null,
      };
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              components: state.currentReport.components?.map((comp, index) =>
                index === action.payload.index ? action.payload.component : comp
              ) || [],
            }
          : null,
      };
    case 'REMOVE_COMPONENT':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              components: state.currentReport.components?.filter(
                (_, index) => index !== action.payload
              ) || [],
            }
          : null,
      };
    case 'ADD_PART':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              suggestedParts: [...(state.currentReport.suggestedParts || []), action.payload],
            }
          : null,
      };
    case 'UPDATE_PART':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              suggestedParts: state.currentReport.suggestedParts?.map((part, index) =>
                index === action.payload.index ? action.payload.part : part
              ) || [],
            }
          : null,
      };
    case 'REMOVE_PART':
      return {
        ...state,
        currentReport: state.currentReport
          ? {
              ...state.currentReport,
              suggestedParts: state.currentReport.suggestedParts?.filter(
                (_, index) => index !== action.payload
              ) || [],
            }
          : null,
      };
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_CURRENT_REPORT':
      return { ...state, currentReport: null };
    default:
      return state;
  }
};

interface ReportContextType {
  state: ReportState;
  setCurrentReport: (report: Partial<Report>) => void;
  updateReportField: (field: keyof Report, value: any) => void;
  addComponent: (component: Component) => void;
  updateComponent: (index: number, component: Component) => void;
  removeComponent: (index: number) => void;
  addPart: (part: Part) => void;
  updatePart: (index: number, part: Part) => void;
  removePart: (index: number) => void;
  resetCurrentReport: () => void;
  setReports: (reports: Report[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReport = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  const setCurrentReport = (report: Partial<Report>) => {
    dispatch({ type: 'SET_CURRENT_REPORT', payload: report });
  };

  const updateReportField = (field: keyof Report, value: any) => {
    dispatch({ type: 'UPDATE_REPORT_FIELD', payload: { field, value } });
  };

  const addComponent = (component: Component) => {
    dispatch({ type: 'ADD_COMPONENT', payload: component });
  };

  const updateComponent = (index: number, component: Component) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { index, component } });
  };

  const removeComponent = (index: number) => {
    dispatch({ type: 'REMOVE_COMPONENT', payload: index });
  };

  const addPart = (part: Part) => {
    dispatch({ type: 'ADD_PART', payload: part });
  };

  const updatePart = (index: number, part: Part) => {
    dispatch({ type: 'UPDATE_PART', payload: { index, part } });
  };

  const removePart = (index: number) => {
    dispatch({ type: 'REMOVE_PART', payload: index });
  };

  const resetCurrentReport = () => {
    dispatch({ type: 'RESET_CURRENT_REPORT' });
  };

  const setReports = (reports: Report[]) => {
    dispatch({ type: 'SET_REPORTS', payload: reports });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: ReportContextType = {
    state,
    setCurrentReport,
    updateReportField,
    addComponent,
    updateComponent,
    removeComponent,
    addPart,
    updatePart,
    removePart,
    resetCurrentReport,
    setReports,
    setLoading,
    setError,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};