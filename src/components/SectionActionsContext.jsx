import { createContext, useContext } from 'react';

export const SectionActionsContext = createContext({ removeSection: null });

export function useSectionActions() {
  return useContext(SectionActionsContext);
}
