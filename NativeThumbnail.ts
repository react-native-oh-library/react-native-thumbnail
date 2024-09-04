import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  get(filePath: string): Promise<{ path: string, width: number, height: number }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("ThumbnailTurboModule");
