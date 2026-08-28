import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent } from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { Atom, Bond, ToolType } from '../types';
import { CPK_COLORS, computeImplicitHydrogens } from '../utils/chemistry';

const BOND_LENGTH = 20;
const HEX_SIZE = 30; // distance from center to vertex
const DX = 1.5 * HEX_SIZE; //45
const DY = Math.sqrt(3) * HEX_SIZE; // 34.641016...

export function Canvas2D() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    atoms, bonds, displayOptions, activeTool, activeAtomElement, activeBondType,
    camera, setCamera, addAtom, addBond, removeAtom, removeBond, 
    selectedAtomIds, selectedBondIds, setSelection, toggleSelection, clearSelection
  } = useEditorStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [drawingBondFrom, setDrawingBondFrom] = useState<string | null>(null);
  const [drawingFGFrom, setDrawingFGFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (e: ReactMouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - camera.x) / camera.zoom;
    const y = (e.clientY - rect.top - camera.y) / camera.zoom;

    // Hexagonal snapping formula bc square grid is bad for hexagons
    //col = Math.round((x-offset)/dx) = Math.round((x - ((row % 2) * 17.32)) / 34.64)
    //offset = (row%2) * dx/2, dx = W = 1.732R if R = 20 dx = 34.64
    //row = Math.round(y/dy) dy = 3/4H = 1.5R if R = 20 dy = 30 so row = Math.round(y/30)
    //x snap = Math.round((x - ((row % 2) * 17.32)) / 34.64) * 34.64 + ((row % 2) * 17.32)
    //y snap = Math.round(y / 30) * 30
    
    if (displayOptions.snapToGrid) {
       const row = Math.round(y / DY);
       const offset = (row % 2) * DX / 2;
       const col = Math.round((x - offset) / DX);
       return {
         x: col * DX,
         y: row * DY + ((col % 2) * DY / 2)
       };
    }
    return { x, y };
  };

  // Handle Wheel Zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const zoomDelta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(0.1, camera.zoom * Math.exp(zoomDelta)), 5);
      
      // Zoom centered on mouse
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
      const newY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);
      
      setCamera({ x: newX, y: newY, zoom: newZoom });
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [camera, setCamera]);

  const handlePointerDown = (e: ReactMouseEvent) => {
    if (e.button === 1 || activeTool === 'pan' || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
      return;
    }
    
    const { x, y } = screenToCanvas(e);
    
    // Check if clicked on empty space
    if (e.target === svgRef.current) {
      if (activeTool === 'atom') {
        const id = Math.random().toString(36).substring(2, 9);
        addAtom({
          id,
          element: activeAtomElement,
          x,
          y,
          z: 0,
          charge: 0,
        });
      } else if (activeTool.startsWith('bond') && !drawingBondFrom) {
        const id = Math.random().toString(36).substring(2, 9);
        addAtom({
          id,
          element: 'C',
          x,
          y,
          z: 0,
          charge: 0,
        });
        setDrawingBondFrom(id);
      } else {
        clearSelection();
      }
    }
  };

  const handlePointerMove = (e: ReactMouseEvent) => {
    const { x, y } = screenToCanvas(e);
    setMousePos({ x, y });
    
    if (isPanning) {
      setCamera({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };
  // TODO: figure out why this is causing excess carbons to be created over other atoms when drawing bonds
  const handlePointerUp = (e: ReactMouseEvent) => {
    setIsPanning(false);
    if (drawingBondFrom) {
      const { x, y } = screenToCanvas(e);
      // If dropped in empty space, maybe create a new atom and connect it?
      const targetElement = document.elementFromPoint(x, y);
      const targetIsAtom = targetElement?.getAttribute('data-type') === 'atom';
      
      if (!targetIsAtom && activeTool.startsWith('bond')) {
         //const { x, y } = screenToCanvas(e);
         // Standardize bond length if possible
         const fromAtom = atoms.find(a => a.id === drawingBondFrom);
         let finalX = x; let finalY = y; let finalZ = 0;
         
         if (fromAtom) {
           const dx = x - fromAtom.x;
           const dy = y - fromAtom.y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           if (HEX_SIZE < dist && dist < HEX_SIZE*2) {
             if (activeTool === 'bond-wedge') finalZ = -20;
             if (activeTool === 'bond-dash') finalZ = 20;
             // finalX = fromAtom.x + (dx/dist) * BOND_LENGTH;
             // finalY = fromAtom.y + (dy/dist) * BOND_LENGTH;
             const newAtomId = Math.random().toString(36).substring(2, 9);
              addAtom({ 
                id: newAtomId, 
                element: activeAtomElement, 
                x: finalX, 
                y: finalY, 
                z: finalZ, 
                charge: 0,
              });

              const bondId = Math.random().toString(36).substring(2, 9);
              let order = 1;
              if (activeTool === 'bond-double') order = 2;
              if (activeTool === 'bond-triple') order = 3;

              addBond({
                id: bondId,
                fromAtomId: drawingBondFrom,
                toAtomId: newAtomId,
                order: order as any,
                type: activeBondType
              });
            }
         }
      }
      setDrawingBondFrom(null);
    }
  };

  const handleAtomPointerDown = (e: ReactMouseEvent, id: string) => {
    e.stopPropagation();
    if (activeTool.startsWith('bond')) {
      setDrawingBondFrom(id);
    } else if (activeTool === 'select') {
      if (e.shiftKey) {
        toggleSelection(id, 'atom');
      } else {
        setSelection([id], []);
      }
    } else if (activeTool === 'atom') {
      // Change element
      useEditorStore.getState().updateAtom(id, { element: activeAtomElement, hydrogens: computeImplicitHydrogens(atoms.find(a => a.id === id)!, bonds) });
    } else if (activeTool === 'erase') {
      removeAtom(id);
    }
  };

  const handleAtomPointerEnter = (e: ReactMouseEvent, id: string) => {
    if (drawingBondFrom && drawingBondFrom !== id) {
       // Snapping highlight
    }
  };

  const handleAtomPointerUp = (e: ReactMouseEvent, id: string) => {
    //e.stopPropagation();
    if (drawingBondFrom && drawingBondFrom !== id) {
       const bondId = Math.random().toString(36).substring(2, 9);
       let order = 1;
       if (activeTool === 'bond-double') order = 2;
       if (activeTool === 'bond-triple') order = 3;
       
       addBond({
         id: bondId,
         fromAtomId: drawingBondFrom,
         toAtomId: id,
         order: order as any,
         type: activeBondType
       });
       setDrawingBondFrom(null);
    }
  };
  
  // Render bonds
  const renderBond = (bond: Bond) => {
    const a1 = atoms.find(a => a.id === bond.fromAtomId);
    const a2 = atoms.find(a => a.id === bond.toAtomId);
    if (!a1 || !a2) return null;

    //Check if bond is branched
    const carboxyl = (a1.element === 'C' && a2.element !== 'C');
    //const alkene = (a1.element === 'C' && a2.element === 'C');
    
    const isSelected = selectedBondIds.has(bond.id);
    const color = isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))';
    const strokeWidth = 1;
    
    // Calculate vector
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const length = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy / length; // normal vector for offsets
    const ny = dx / length;

    const offset = 4;
    const trim = 4; // pixels to trim from each end of the bond

    // const sx = a1.x + ny * trim + nx * offset;
    // const sy = a1.y - nx * trim + ny * offset;

    // const ex = a2.x - ny * trim + nx * offset;
    // const ey = a2.y + nx * trim + ny * offset;
    
    let path = '';
    
    if (bond.order === 1) {
      if (carboxyl) {
        path = `M ${a1.x} ${a1.y} L ${a2.x - ny*trim*2} ${a2.y + nx*trim*2}`;
      } else {
        path = `M ${a1.x} ${a1.y} L ${a2.x} ${a2.y}`;
      }
    } else if (bond.order === 2) {
      if (carboxyl) {
        path = `M ${a1.x - ny + nx*offset*0.5} ${a1.y + nx + ny*offset*0.5} L ${a2.x - ny*trim*2 + nx*offset*0.5} ${a2.y + nx*trim*2 + ny*offset*0.5}
        M ${a1.x - ny - nx*offset*0.5} ${a1.y + nx - ny*offset*0.5} L ${a2.x - ny*trim*2 - nx*offset*0.5} ${a2.y + nx*trim*2 - ny*offset*0.5}`;
      } else {
        path = `M ${a1.x} ${a1.y} L ${a2.x} ${a2.y}
              M ${a1.x + ny*trim + nx*offset} ${a1.y - nx*trim + ny*offset} L ${a2.x - ny*trim + nx*offset} ${a2.y + nx*trim + ny*offset}`;
      } 
      // else {
      //   path = `M ${a1.x} ${a1.y} L ${a2.x} ${a2.y}
      //         M ${a1.x + nx*offset} ${a1.y + ny*offset} L ${a2.x + nx*offset} ${a2.y + ny*offset}`;
      // }
    } else if (bond.order === 3) {
      path = `M ${a1.x} ${a1.y} L ${a2.x} ${a2.y}
              M ${a1.x + nx*offset} ${a1.y + ny*offset} L ${a2.x + nx*offset} ${a2.y + ny*offset}
              M ${a1.x - nx*offset} ${a1.y - ny*offset} L ${a2.x - nx*offset} ${a2.y - ny*offset}`;
    }

    if (bond.type === 'wedge') {
       // Polygon
       return (
         <polygon 
            points={`${a1.x},${a1.y} ${a2.x + nx*offset*1.5},${a2.y + ny*offset*1.5} ${a2.x - nx*offset*1.5},${a2.y - ny*offset*1.5}`}
            fill={color}
            onClick={(e) => { e.stopPropagation(); if (activeTool === 'select') toggleSelection(bond.id, 'bond'); }}
            style={{ cursor: 'pointer' }}
         />
       );
    }

    if (bond.type === 'dash') {
      // Dashed wedge
      const DASHES = 6;
      const WIDTH = 6;   // half-width at the wide end

      const dashes = [];

      for (let i = 1; i <= DASHES; i++) {
          const t = i / (DASHES);

          // center point along the bond
          const cx = a1.x + (a2.x - a1.x) * t;
          const cy = a1.y + (a2.y - a1.y) * t;

          // width increases toward the back atom
          const w = WIDTH * t;

          dashes.push({
              x1: cx - nx * w,
              y1: cy - ny * w,
              x2: cx + nx * w,
              y2: cy + ny * w,
          });
      }
      
      path = `M ${dashes[0].x1} ${dashes[0].y1} L ${dashes[0].x2} ${dashes[0].y2}
      M ${dashes[1].x1} ${dashes[1].y1} L ${dashes[1].x2} ${dashes[1].y2}
      M ${dashes[2].x1} ${dashes[2].y1} L ${dashes[2].x2} ${dashes[2].y2}
      M ${dashes[3].x1} ${dashes[3].y1} L ${dashes[3].x2} ${dashes[3].y2}
      M ${dashes[4].x1} ${dashes[4].y1} L ${dashes[4].x2} ${dashes[4].y2}
      M ${dashes[5].x1} ${dashes[5].y1} L ${dashes[5].x2} ${dashes[5].y2}`;
    }

    return (
      <path 
        key={bond.id}
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        onClick={(e) => { 
          e.stopPropagation(); 
          if (activeTool === 'select') toggleSelection(bond.id, 'bond');
          if (activeTool === 'erase') removeBond(bond.id);
          if (activeTool === 'bond-single') useEditorStore.getState().updateBond(bond.id, { order: 1 });
          if (activeTool === 'bond-double') useEditorStore.getState().updateBond(bond.id, { order: 2 });
          if (activeTool === 'bond-triple') useEditorStore.getState().updateBond(bond.id, { order: 3 });
        }}
        style={{ cursor: 'pointer' }}
        className="transition-colors"
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-background ${displayOptions.showGrid ? 'bg-dot-grid' : ''}`}
      style={{
         backgroundPosition: `${camera.x}px ${camera.y}px, ${camera.x + DX * camera.zoom}px ${camera.y + DY / 2 * camera.zoom}px`,
         backgroundSize: `${2* DX * camera.zoom}px ${DY * camera.zoom}px`
      }}
    >
      <svg
        id="canvas-2d-svg"
        ref={svgRef}
        className="w-full h-full absolute inset-0 outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        tabIndex={0}
      >
        <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
          {/* Active drawing bond */}
          {drawingBondFrom && atoms.find(a => a.id === drawingBondFrom) && (
            <line 
              x1={atoms.find(a => a.id === drawingBondFrom)!.x}
              y1={atoms.find(a => a.id === drawingBondFrom)!.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="4 4"
              opacity={0.5}
            />
          )}

          {/* Render real bonds */}
          {bonds.map(renderBond)}

          {/* Render atoms */}
          {atoms.map((atom) => {
             const isSelected = selectedAtomIds.has(atom.id);
             const isCarbon = atom.element === 'C';
             
             // Check if it's a bare carbon (no bonds). If so, we might want to show it.
             const connectedBonds = bonds.filter(b => b.fromAtomId === atom.id || b.toAtomId === atom.id);
             // Check if atom has bond(s) on the right side
             const rightBonds = connectedBonds.filter(b => {
               const otherAtom = atoms.find(a => a.id === (b.fromAtomId === atom.id ? b.toAtomId : b.fromAtomId));
               return otherAtom && otherAtom.x > atom.x;
             });

             const hydrogens = computeImplicitHydrogens(atom, bonds);
             
             const showLabel = !displayOptions.showSkeleton || !isCarbon || connectedBonds.length === 0;
             const alignLabelRight = rightBonds.length > 0 && hydrogens > 0;
             const color = CPK_COLORS[atom.element] || '#fff';
             
             return (
               <g 
                 key={atom.id}
                 transform={`translate(${atom.x}, ${atom.y})`}
                 onPointerDown={(e) => handleAtomPointerDown(e, atom.id)}
                 onPointerUp={(e) => handleAtomPointerUp(e, atom.id)}
                 onPointerEnter={(e) => handleAtomPointerEnter(e, atom.id)}
                 className="cursor-pointer"
                 data-type="atom"
               >
                 {isSelected && (
                   <circle r={20} fill="hsl(var(--primary))" opacity={0.3} />
                 )}
                 
                 {/* Invisible hit area */}
                 <circle r={20} fill="transparent" />
                 
                 {showLabel && (
                   <text 
                     fill={color} 
                     fontSize="16px" 
                     fontFamily="var(--font-sans)" 
                     fontWeight="600"
                     textAnchor={alignLabelRight ? 'end' : 'start'}
                     dominantBaseline="central"
                     pointerEvents="none"
                     x={alignLabelRight ? -6 : -6}
                     style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                   >
                     <tspan dx="0" y="6">
                        {!alignLabelRight ? atom.element : ''}
                      </tspan>
                     <tspan dx={alignLabelRight && hydrogens > 1 ? "-6" : "0"} y="6">
                       {hydrogens > 0 ? 'H' : ''}
                      </tspan>
                     <tspan dx={alignLabelRight ? "-5" : "0"} y="10" fontSize="10px">
                        {hydrogens > 1 ? hydrogens : ''}
                      </tspan>
                     <tspan dx={hydrogens > 1 ? "5" : "0"} y="6">
                        {alignLabelRight ? atom.element : ''}
                      </tspan>
                     {atom.charge !== 0 && (
                        <tspan dx="2" y="-6" fontSize="10px">
                          {Math.abs(atom.charge) > 1 ? Math.abs(atom.charge) : ''}{atom.charge > 0 ? '+' : '-'}
                        </tspan>
                     )}
                   </text>
                 ) 
                   //: (
                   /* Draw a small circle for connected carbons if not showing label, or just let bonds connect implicitly */
                 //   <circle r={3} fill={isSelected ? 'hsl(var(--primary))' : color} opacity={connectedBonds.length === 0 ? 1 : 0} />
                 // )
                 }
               </g>
             );
          })}
        </g>
      </svg>
    </div>
  );
}
