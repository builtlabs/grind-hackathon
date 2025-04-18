// stubs/use-effect-event.js
import * as React from 'react';

// https://github.com/radix-ui/primitives/issues/3485
export function useEffectEvent(handler) {
  const handlerRef = React.useRef(handler);
  React.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  return React.useCallback((...args) => {
    return handlerRef.current(...args);
  }, []);
}
