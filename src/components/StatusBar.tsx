import React from 'react';
import { useEditorStore } from '../state/useEditorStore';

export function StatusBar() {
  const { atoms, bonds, activeTool, activeAtomElement, viewMode, camera, selectedAtomIds, selectedBondIds } = useEditorStore();

  return (
    <div className="h-6 bg-card border-t border-border flex items-center justify-between px-3 shrink-0 text-[10px] text-muted-foreground font-mono">
      <div className="flex items-center space-x-4">
        <span>{atoms.length} Atoms</span>
        <span>{bonds.length} Bonds</span>
        {selectedAtomIds.size > 0 && (
           <span className="text-primary">{selectedAtomIds.size} selected</span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="uppercase text-secondary">
          Mode: {viewMode} | Tool: {activeTool} {activeTool === 'atom' ? `(${activeAtomElement})` : ''}
        </span>
        <span>
          View: ({camera.x.toFixed(0)}, {camera.y.toFixed(0)}) @ {(camera.zoom * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
