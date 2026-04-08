import { createContext, useContext } from 'react';

export const CanvasEditorContext = createContext(null);

export function useCanvasEditor() {
  return useContext(CanvasEditorContext);
}
