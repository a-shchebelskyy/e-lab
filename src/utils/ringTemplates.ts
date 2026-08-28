// relative coordinates for standard ring templates

export function generateRing(size: number, bondLength: number = 50) {
  const atoms: { x: number; y: number }[] = [];
  const bonds: [number, number][] = [];
  
  const angleStep = (2 * Math.PI) / size;
  // Start from top
  const startAngle = -Math.PI / 2;
  
  const radius = bondLength / (2 * Math.sin(Math.PI / size));

  for (let i = 0; i < size; i++) {
    const angle = startAngle + i * angleStep;
    atoms.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
    
    bonds.push([i, (i + 1) % size]);
  }

  return { atoms, bonds };
}

export const PREBUILT_MOLECULES = {
  benzene: {
    atoms: [
      { id: 'a1', element: 'C', x: 0, y: -50, charge: 0 },
      { id: 'a2', element: 'C', x: 43.3, y: -25, charge: 0 },
      { id: 'a3', element: 'C', x: 43.3, y: 25, charge: 0 },
      { id: 'a4', element: 'C', x: 0, y: 50, charge: 0 },
      { id: 'a5', element: 'C', x: -43.3, y: 25, charge: 0 },
      { id: 'a6', element: 'C', x: -43.3, y: -25, charge: 0 }
    ],
    bonds: [
      { id: 'b1', fromAtomId: 'a1', toAtomId: 'a2', order: 2, type: 'double' },
      { id: 'b2', fromAtomId: 'a2', toAtomId: 'a3', order: 1, type: 'single' },
      { id: 'b3', fromAtomId: 'a3', toAtomId: 'a4', order: 2, type: 'double' },
      { id: 'b4', fromAtomId: 'a4', toAtomId: 'a5', order: 1, type: 'single' },
      { id: 'b5', fromAtomId: 'a5', toAtomId: 'a6', order: 2, type: 'double' },
      { id: 'b6', fromAtomId: 'a6', toAtomId: 'a1', order: 1, type: 'single' }
    ]
  },
  caffeine: {
    // simplified version for demo
    atoms: [
      { id: 'a1', element: 'N', x: -30, y: 20, charge: 0 },
      { id: 'a2', element: 'C', x: 0, y: 40, charge: 0 },
      { id: 'a3', element: 'N', x: 30, y: 20, charge: 0 },
      { id: 'a4', element: 'C', x: 30, y: -10, charge: 0 },
      { id: 'a5', element: 'C', x: 0, y: -30, charge: 0 },
      { id: 'a6', element: 'C', x: -30, y: -10, charge: 0 },
      { id: 'a7', element: 'O', x: 0, y: 70, charge: 0 },
      { id: 'a8', element: 'O', x: -60, y: -30, charge: 0 },
      { id: 'a9', element: 'N', x: 60, y: -30, charge: 0 },
      { id: 'a10', element: 'C', x: 30, y: -50, charge: 0 },
      { id: 'a11', element: 'C', x: 60, y: -60, charge: 0 },
      { id: 'a12', element: 'C', x: 80, y: -10, charge: 0 },
      { id: 'a13', element: 'C', x: -60, y: 40, charge: 0 },
      { id: 'a14', element: 'C', x: 50, y: 50, charge: 0 }
    ],
    bonds: [
      { id: 'b1', fromAtomId: 'a1', toAtomId: 'a2', order: 1, type: 'single' },
      { id: 'b2', fromAtomId: 'a2', toAtomId: 'a3', order: 1, type: 'single' },
      { id: 'b3', fromAtomId: 'a3', toAtomId: 'a4', order: 1, type: 'single' },
      { id: 'b4', fromAtomId: 'a4', toAtomId: 'a5', order: 2, type: 'double' },
      { id: 'b5', fromAtomId: 'a5', toAtomId: 'a6', order: 1, type: 'single' },
      { id: 'b6', fromAtomId: 'a6', toAtomId: 'a1', order: 1, type: 'single' },
      { id: 'b7', fromAtomId: 'a2', toAtomId: 'a7', order: 2, type: 'double' },
      { id: 'b8', fromAtomId: 'a6', toAtomId: 'a8', order: 2, type: 'double' },
      { id: 'b9', fromAtomId: 'a4', toAtomId: 'a9', order: 1, type: 'single' },
      { id: 'b10', fromAtomId: 'a5', toAtomId: 'a10', order: 1, type: 'single' },
      { id: 'b11', fromAtomId: 'a10', toAtomId: 'a9', order: 2, type: 'double' },
      { id: 'b12', fromAtomId: 'a9', toAtomId: 'a12', order: 1, type: 'single' },
      { id: 'b13', fromAtomId: 'a1', toAtomId: 'a13', order: 1, type: 'single' },
      { id: 'b14', fromAtomId: 'a3', toAtomId: 'a14', order: 1, type: 'single' }
    ]
  }
};
