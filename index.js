
import { NativeModules, TurboModuleRegistry } from 'react-native';

const NativeThumbnail = TurboModuleRegistry.get('ThumbnailTurboModule');
const RNThumbnail = NativeThumbnail ? NativeThumbnail : NativeModules.RNThumbnail;

export default RNThumbnail;
