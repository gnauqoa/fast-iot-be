import { SRID } from '../../test/utils/constants';

/**
 * Creates a SQL expression for a PostGIS point
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate
 * @returns SQL string for a PostGIS point
 */
export const createPointExpression = (
  longitude: number,
  latitude: number,
): string => {
  return `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${SRID})`;
};
