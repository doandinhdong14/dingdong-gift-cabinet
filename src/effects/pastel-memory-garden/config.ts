import { createConfigCodec, type ConfigCodec } from '../../effect-sdk';

export interface CharacterItem {
  id: string;
  name: string;
  imageUrl: string;
  worldX: number;
  baselineY: number;
  scale: number;
  zIndex?: number;
  labelOffsetY?: number;
  visible?: boolean;
}

export interface PastelMemoryGardenConfig {
  /** Tốc độ cuộn ngang panorama (% bề rộng màn hình / giây) */
  scrollSpeed: number;
  /** Độ chênh lệch chiều sâu parallax giữa các lớp (0 - 1) */
  parallaxStrength: number;
  /** Mật độ hoa (giữ tương thích) */
  flowerDensity: number;
  /** Bật/tắt hoa tiền cảnh ở chân */
  showForegroundFlowers: boolean;
  /** Chiều cao hoa tiền cảnh (% màn hình, chỉ che nhẹ chân/mép váy) */
  foregroundFlowerHeight: number;
  /** Mật độ và tỷ lệ hoa tiền cảnh */
  foregroundFlowerDensity: number;
  /** Độ bóng lụa và lượn sóng của dải ruy băng satin (0 - 1.5) */
  ribbonIntensity: number;
  /** Độ gợn sóng và phản chiếu của mặt nước (0 - 1) */
  reflectionStrength: number;
  /** Số lượng bướm pastel bay lượn trong khung cảnh (0 - 12) */
  butterflyCount: number;
  /** Bảng màu hoàng hôn nền */
  backgroundPalette: 'sunset' | 'dawn' | 'rose' | 'golden';
  /** Tự động cuộn liên tục */
  autoPlay: boolean;
  /** Cho phép kéo vuốt ngang bằng chuột hoặc chạm */
  dragEnabled: boolean;
  /** Hiển thị nhãn tên viết tay thanh lịch dưới nhân vật */
  showNames: boolean;
  /** Trạng thái bật/tắt âm thanh */
  soundEnabled: boolean;
  /** Chế độ kiểm tra layer (QA Debug Modes: TEST A to TEST F) */
  testMode:
    | 'normal'
    | 'testA_bg_only'
    | 'testB_bg_girls'
    | 'testC_with_foreground'
    | 'testD_replace_demo'
    | 'testE_hide_girls'
    | 'testF_panorama_motion';
  /** Danh sách nhân vật (người dùng tự chèn/upload) */
  characters: CharacterItem[];
}

export const defaults: PastelMemoryGardenConfig = {
  scrollSpeed: 0.16,
  parallaxStrength: 0.40,
  flowerDensity: 1.0,
  showForegroundFlowers: true,
  foregroundFlowerHeight: 0.22,
  foregroundFlowerDensity: 1.0,
  ribbonIntensity: 1.0,
  reflectionStrength: 0.45,
  butterflyCount: 4,
  backgroundPalette: 'sunset',
  autoPlay: true,
  dragEnabled: true,
  showNames: true,
  soundEnabled: false,
  testMode: 'normal',
  characters: [],
};

export const configCodec: ConfigCodec<PastelMemoryGardenConfig> = createConfigCodec<PastelMemoryGardenConfig>(
  (input: unknown) => {
    if (!input || typeof input !== 'object') {
      return { success: false, errors: [{ path: '', message: 'Config must be an object' }] };
    }

    const obj = input as Record<string, unknown>;

    const scrollSpeed =
      typeof obj.scrollSpeed === 'number' && Number.isFinite(obj.scrollSpeed)
        ? Math.max(0, Math.min(0.5, obj.scrollSpeed))
        : defaults.scrollSpeed;

    const parallaxStrength =
      typeof obj.parallaxStrength === 'number' && Number.isFinite(obj.parallaxStrength)
        ? Math.max(0, Math.min(1.0, obj.parallaxStrength))
        : defaults.parallaxStrength;

    const flowerDensity =
      typeof obj.flowerDensity === 'number' && Number.isFinite(obj.flowerDensity)
        ? Math.max(0.5, Math.min(2.0, obj.flowerDensity))
        : defaults.flowerDensity;

    const showForegroundFlowers =
      typeof obj.showForegroundFlowers === 'boolean'
        ? obj.showForegroundFlowers
        : defaults.showForegroundFlowers;

    const foregroundFlowerHeight =
      typeof obj.foregroundFlowerHeight === 'number' && Number.isFinite(obj.foregroundFlowerHeight)
        ? Math.max(0.1, Math.min(0.45, obj.foregroundFlowerHeight))
        : defaults.foregroundFlowerHeight;

    const foregroundFlowerDensity =
      typeof obj.foregroundFlowerDensity === 'number' && Number.isFinite(obj.foregroundFlowerDensity)
        ? Math.max(0.5, Math.min(2.0, obj.foregroundFlowerDensity))
        : defaults.foregroundFlowerDensity;

    const ribbonIntensity =
      typeof obj.ribbonIntensity === 'number' && Number.isFinite(obj.ribbonIntensity)
        ? Math.max(0, Math.min(1.5, obj.ribbonIntensity))
        : defaults.ribbonIntensity;

    const reflectionStrength =
      typeof obj.reflectionStrength === 'number' && Number.isFinite(obj.reflectionStrength)
        ? Math.max(0, Math.min(1.0, obj.reflectionStrength))
        : defaults.reflectionStrength;

    const butterflyCount =
      typeof obj.butterflyCount === 'number' && Number.isFinite(obj.butterflyCount)
        ? Math.max(0, Math.min(12, Math.round(obj.butterflyCount)))
        : defaults.butterflyCount;

    const validPalettes = ['sunset', 'dawn', 'rose', 'golden'];
    const backgroundPalette =
      typeof obj.backgroundPalette === 'string' && validPalettes.includes(obj.backgroundPalette)
        ? (obj.backgroundPalette as PastelMemoryGardenConfig['backgroundPalette'])
        : defaults.backgroundPalette;

    const autoPlay = typeof obj.autoPlay === 'boolean' ? obj.autoPlay : defaults.autoPlay;
    const dragEnabled = typeof obj.dragEnabled === 'boolean' ? obj.dragEnabled : defaults.dragEnabled;
    const showNames = typeof obj.showNames === 'boolean' ? obj.showNames : defaults.showNames;
    const soundEnabled = typeof obj.soundEnabled === 'boolean' ? obj.soundEnabled : defaults.soundEnabled;

    const validTestModes = [
      'normal',
      'testA_bg_only',
      'testB_bg_girls',
      'testC_with_foreground',
      'testD_replace_demo',
      'testE_hide_girls',
      'testF_panorama_motion',
    ];
    const testMode =
      typeof obj.testMode === 'string' && validTestModes.includes(obj.testMode)
        ? (obj.testMode as PastelMemoryGardenConfig['testMode'])
        : defaults.testMode;

    const characters: CharacterItem[] = Array.isArray(obj.characters)
      ? obj.characters
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map((item, index) => ({
            id: typeof item.id === 'string' && item.id.trim() ? item.id : `char_${index}_${Date.now()}`,
            name: typeof item.name === 'string' ? item.name : '',
            imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
            worldX: typeof item.worldX === 'number' && Number.isFinite(item.worldX) ? item.worldX : 500 * (index + 1),
            baselineY:
              typeof item.baselineY === 'number' && Number.isFinite(item.baselineY)
                ? Math.max(20, Math.min(80, item.baselineY))
                : 58,
            scale:
              typeof item.scale === 'number' && Number.isFinite(item.scale)
                ? Math.max(0.4, Math.min(2.5, item.scale))
                : 1.0,
            zIndex: typeof item.zIndex === 'number' ? item.zIndex : 10,
            labelOffsetY: typeof item.labelOffsetY === 'number' ? item.labelOffsetY : 0,
            visible: typeof item.visible === 'boolean' ? item.visible : true,
          }))
      : [];

    return {
      success: true,
      data: {
        scrollSpeed,
        parallaxStrength,
        flowerDensity,
        showForegroundFlowers,
        foregroundFlowerHeight,
        foregroundFlowerDensity,
        ribbonIntensity,
        reflectionStrength,
        butterflyCount,
        backgroundPalette,
        autoPlay,
        dragEnabled,
        showNames,
        soundEnabled,
        testMode,
        characters,
      },
    };
  }
);
