import type { CharacterItem } from '../config';

// Import flawless silhouettes
import phuongThaoImg from '../assets/portrait_phuong_thao.png';
import thuyDuongImg from '../assets/portrait_thuy_duong.png';
import brownDressImg from '../assets/portrait_brown_dress.png';
import eyeGestureImg from '../assets/portrait_eye_gesture.png';
import blueShirtImg from '../assets/portrait_blue_shirt.png';
import khanhNgocImg from '../assets/portrait_khanh_ngoc.png';
import glassesPoseImg from '../assets/portrait_glasses_pose.png';
import whiteDressSitImg from '../assets/portrait_white_dress_sit.png';

export const DEFAULT_CHARACTERS: CharacterItem[] = [
  {
    id: 'char_phuong_thao',
    name: 'Phương Thảo',
    imageUrl: phuongThaoImg,
    worldX: 520,
    baselineY: 58,
    scale: 1.05,
    zIndex: 10,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_thuy_duong',
    name: 'Thùy Dương',
    imageUrl: thuyDuongImg,
    worldX: 1100,
    baselineY: 57,
    scale: 1.0,
    zIndex: 9,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_brown_dress',
    name: 'Mỹ Duyên',
    imageUrl: brownDressImg,
    worldX: 1750,
    baselineY: 59,
    scale: 1.05,
    zIndex: 10,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_eye_gesture',
    name: 'Thanh Trúc',
    imageUrl: eyeGestureImg,
    worldX: 2400,
    baselineY: 56,
    scale: 1.02,
    zIndex: 9,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_khanh_ngoc',
    name: 'Khánh Ngọc',
    imageUrl: khanhNgocImg,
    worldX: 3050,
    baselineY: 57,
    scale: 1.06,
    zIndex: 10,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_blue_shirt',
    name: 'Mai Anh',
    imageUrl: blueShirtImg,
    worldX: 3700,
    baselineY: 58,
    scale: 0.98,
    zIndex: 9,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_glasses_pose',
    name: 'Bích Ngọc',
    imageUrl: glassesPoseImg,
    worldX: 4350,
    baselineY: 57,
    scale: 1.02,
    zIndex: 10,
    labelOffsetY: 0,
    visible: true,
  },
  {
    id: 'char_white_dress_sit',
    name: 'Tú Anh',
    imageUrl: whiteDressSitImg,
    worldX: 4950,
    baselineY: 59,
    scale: 1.04,
    zIndex: 10,
    labelOffsetY: 0,
    visible: true,
  },
];
