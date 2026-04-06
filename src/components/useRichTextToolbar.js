import { useContext } from 'react';
import { RichTextToolbarContext } from './richTextToolbarContextValue';

export function useRichTextToolbar() {
  return useContext(RichTextToolbarContext);
}
