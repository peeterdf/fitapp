import { useAppMode } from '../contexts/AppModeContext';
import { FeatureKey } from '../config/modes';

export function useFeature(key: FeatureKey): boolean {
  const { mode } = useAppMode();
  return mode.features[key] ?? true;
}

export function useBranding() {
  const { mode } = useAppMode();
  return mode.branding;
}
