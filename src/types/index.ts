export interface Atom {
  id: string;
  element: string; // "C", "H", "N", etc.
  x: number; // canvas coordinates
  y: number;
  z: number;
  charge: number; // formal charge (-2 to +2)
  isotope?: number;
  radical?: number; // 0=none, 1=doublet, 2=triplet
  hydrogens?: number; // implicit H count override
}

export interface Bond {
  id: string;
  fromAtomId: string;
  toAtomId: string;
  order: 1 | 2 | 3 | 4; // 4=aromatic
  type: 'single' | 'double' | 'triple' | 'aromatic' | 'wedge' | 'dash' | 'coordinate' | 'hydrogen';
  stereo?: 'up' | 'down';
}

export interface Annotation {
  id: string;
  type: 'text' | 'reaction-arrow' | 'equilibrium-arrow' | 'curved-arrow' | 'lone-pair';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
}

export interface Project {
  id: string;
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  annotations: Annotation[];
  viewMode: '2d' | '3d';
  camera: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
}

export type ToolType = 
  | 'select' | 'pan' | 'rect-select' | 'lasso'
  | 'bond-single' | 'bond-double' | 'bond-triple' | 'bond-aromatic' | 'bond-wedge' | 'bond-dash' | 'bond-coordinate' | 'bond-hydrogen' | 'group-phenyl'
  | 'atom' | 'erase' | 'measure';
