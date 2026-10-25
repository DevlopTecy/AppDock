import { AppGroup, GroupDensity } from '../types/dock';

export interface DensityLayout {
  density: 'large' | 'medium' | 'compact';
  iconSize: number;
  cardHeight: number;
  minColWidth: number;
  gap: number;
  fontSize: number;
}

export function resolveGroupDensity(
  group: Partial<AppGroup>,
  containerWidth?: number
): DensityLayout {
  const count = group.items ? group.items.length : 0;
  const preferredDensity: GroupDensity = group.density || 'auto';
  const isNarrow = typeof containerWidth === 'number' && containerWidth <= 245;

  let effective: 'large' | 'medium' | 'compact';

  if (preferredDensity !== 'auto') {
    effective = preferredDensity;
  } else {
    if (count <= 4) {
      effective = 'large';
    } else if (count <= 8) {
      effective = 'medium';
    } else {
      effective = 'compact';
    }
  }

  if (isNarrow) {
    switch (effective) {
      case 'large':
        return {
          density: 'large',
          iconSize: 38,
          cardHeight: 76,
          minColWidth: 62,
          gap: 6,
          fontSize: 10.5
        };
      case 'medium':
        return {
          density: 'medium',
          iconSize: 30,
          cardHeight: 64,
          minColWidth: 52,
          gap: 5,
          fontSize: 10
        };
      case 'compact':
      default:
        return {
          density: 'compact',
          iconSize: 24,
          cardHeight: 56,
          minColWidth: 44,
          gap: 4,
          fontSize: 9.5
        };
    }
  }

  switch (effective) {
    case 'large':
      return {
        density: 'large',
        iconSize: 48,
        cardHeight: 92,
        minColWidth: 92,
        gap: 8,
        fontSize: 12
      };
    case 'medium':
      return {
        density: 'medium',
        iconSize: 36,
        cardHeight: 74,
        minColWidth: 70,
        gap: 6,
        fontSize: 11
      };
    case 'compact':
    default:
      return {
        density: 'compact',
        iconSize: 28,
        cardHeight: 62,
        minColWidth: 56,
        gap: 5,
        fontSize: 10
      };
  }
}

export default resolveGroupDensity;
