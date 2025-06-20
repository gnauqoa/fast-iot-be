export interface Point {
  coordinates: number[];
}

export interface Geometry {
  type: string;
  coordinates: number[];
  srid?: number;
}

export interface PostGISPoint extends Point {
  type: 'Point';
}
