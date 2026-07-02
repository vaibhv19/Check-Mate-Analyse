/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { WorkbenchState } from '../types/state';
import type { WorkbenchAction } from './reducer';
import { workbenchReducer, initialState } from './reducer';

const StateContext = createContext<WorkbenchState | undefined>(undefined);
const DispatchContext = createContext<React.Dispatch<WorkbenchAction> | undefined>(undefined);

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workbenchReducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useWorkbenchState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useWorkbenchState must be used within a WorkbenchProvider');
  }
  return context;
}

export function useWorkbenchDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useWorkbenchDispatch must be used within a WorkbenchProvider');
  }
  return context;
}
