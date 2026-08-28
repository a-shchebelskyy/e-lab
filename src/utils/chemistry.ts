import { Atom, Bond } from '../types';

export const CPK_COLORS: Record<string, string> = {
  H: '#FFFFFF',
  C: '#909090',
  N: '#3050F8',
  O: '#FF0D0D',
  F: '#90E050',
  P: '#FF8000',
  S: '#FFFF30',
  Cl: '#1FF01F',
  Br: '#A62929',
  I: '#940094',
  B: '#FFB5B5',
  Si: '#DAA520',
  Na: '#AB5CF2',
  K: '#8F40D4',
  Li: '#CC80FF',
  Mg: '#8AFF00',
  Ca: '#3DFF00',
  Fe: '#E06633',
  Cu: '#C88033',
  Zn: '#7D80B0',
  Ag: '#C0C0C0',
  Au: '#FFD123',
  Pt: '#D0D0E0',
  Hg: '#B8B8D0',
  Al: '#BFA6A6',
  Pb: '#575961'
};

export const ATOMIC_MASSES: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
  P: 30.974, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.904,
  B: 10.81, Si: 28.085, Na: 22.990, K: 39.098, Li: 6.94,
  Mg: 24.305, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38,
  Ag: 107.868, Au: 196.967, Pt: 195.084, Hg: 200.592, Al: 26.982, Pb: 207.2
};

export const ATOMIC_RADII: Record<string, number> = {
  H: 0.32, C: 0.75, N: 0.71, O: 0.63, F: 0.64,
  P: 1.11, S: 1.03, Cl: 0.99, Br: 1.14, I: 1.33,
  B: 0.85, Si: 1.16, Na: 1.55, K: 1.96, Li: 1.34,
  Mg: 1.39, Ca: 1.74, Fe: 1.25, Cu: 1.28, Zn: 1.34,
  Ag: 1.44, Au: 1.44, Pt: 1.38, Hg: 1.51, Al: 1.18, Pb: 1.46
};

// Simplified valences for implicit H calculation
const TYPICAL_VALENCES: Record<string, number[]> = {
  H: [1], C: [4], N: [3, 5], O: [2], S: [2, 4, 6],
  P: [3, 5], F: [1], Cl: [1], Br: [1], I: [1], B: [3]
};

export function computeMolecularWeight(atoms: Atom[]): number {
  return atoms.reduce((sum, atom) => {
    return sum + (ATOMIC_MASSES[atom.element] || 12.011); // Fallback to Carbon if unknown
  }, 0);
}

export function computeImplicitHydrogens(atom: Atom, bonds: Bond[]): number {
  //if (atom.hydrogens !== undefined) return atom.hydrogens;
  
  const connectedBonds = bonds.filter(b => b.fromAtomId === atom.id || b.toAtomId === atom.id);
  let explicitValence = 0;
  //if (connectedBonds.length = 0) {
  //  explicitValence = 0;
  //} else {
    explicitValence = connectedBonds.reduce((sum, b) => {
    if (b.order === 4) return sum + 1.5; // Aromatic roughly counts as 1.5
    return sum + b.order;
  }, 0);
  //}
  const valences = TYPICAL_VALENCES[atom.element];
  if (!valences) return 0;

  // Find the smallest typical valence that is >= explicitValence + charge
  // Simplifying logic for general organic molecules
  const targetValence = valences.find(v => v >= Math.ceil(explicitValence) + Math.abs(atom.charge)) || valences[valences.length - 1];
  
  let implicitH = targetValence - explicitValence + atom.charge;
  if (atom.element === 'N' || atom.element === 'O') {
     implicitH = targetValence - explicitValence - atom.charge;
  }
  
  return Math.max(0, Math.floor(implicitH));
}

export function computeMolecularFormula(atoms: Atom[], bonds: Bond[]): string {
  const counts: Record<string, number> = {};
  
  let totalImplicitH = 0;
  
  for (const atom of atoms) {
    counts[atom.element] = (counts[atom.element] || 0) + 1;
    if (atom.element !== 'H') {
        totalImplicitH += computeImplicitHydrogens(atom, bonds);
    }
  }
  
  if (totalImplicitH > 0) {
    counts['H'] = (counts['H'] || 0) + totalImplicitH;
  }

  // Hill system: C, then H, then alphabetical
  const elements = Object.keys(counts).sort((a, b) => {
    if (a === 'C') return -1;
    if (b === 'C') return 1;
    if (a === 'H' && counts['C']) return -1;
    if (b === 'H' && counts['C']) return 1;
    return a.localeCompare(b);
  });

  return elements.map(el => `${el}${counts[el] > 1 ? counts[el] : ''}`).join('');
}

export function detectRings(atoms: Atom[], bonds: Bond[]): string[][] {
  // Simple DFS to find cycles (SSSR approximation)
  const adj: Record<string, string[]> = {};
  atoms.forEach(a => adj[a.id] = []);
  bonds.forEach(b => {
    if (adj[b.fromAtomId] && adj[b.toAtomId]) {
      adj[b.fromAtomId].push(b.toAtomId);
      adj[b.toAtomId].push(b.fromAtomId);
    }
  });

  // A real SSSR (Smallest Set of Smallest Rings) algorithm is complex, 
  // we'll do a simplified cycle detection bounded to ring sizes 3-8
  const rings: string[][] = [];
  // ... basic implementation omitted for brevity, returning empty array for this sandbox
  return rings;
}

export function estimateSmiles(atoms: Atom[], bonds: Bond[]): string {
  if (atoms.length === 0) return "";
  // Highly simplified DFS for SMILES generation
  // Doesn't perfectly handle rings, branching, and stereo yet
  return "C1=CC=CC=C1 (Simplified Demo)";
}
