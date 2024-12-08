import { useMemo } from "react";
import { useFullscreen, useToggle } from "react-use";

export const useElementFullscreen = (ref: React.RefObject<Element>) => {
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(
    ref,
    show,
    {
      onClose: () => toggle(false)
    }
  );
  return useMemo(() => ({
    isFullscreen,
    toggleFullscreen: toggle,
    goFullscreen: () => toggle(true),
    exitFullscreen: () => toggle(false),
  }), [isFullscreen, toggle]);
};