import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { 
  computeMolecularFormula, 
  computeMolecularWeight, 
  estimateSmiles,
  ATOMIC_MASSES,
  computeImplicitHydrogens
} from '../utils/chemistry';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function RightInspector() {
  const { atoms, bonds, selectedAtomIds, selectedBondIds, updateAtom } = useEditorStore();
  const [formula, setFormula] = useState('');
  const [weight, setWeight] = useState(0);
  const [smiles, setSmiles] = useState('');

  useEffect(() => {
    setFormula(computeMolecularFormula(atoms, bonds));
    setWeight(computeMolecularWeight(atoms));
    setSmiles(estimateSmiles(atoms, bonds));
  }, [atoms, bonds]);

  const selectedAtomsList = Array.from(selectedAtomIds).map(id => atoms.find(a => a.id === id)).filter(Boolean) as typeof atoms;
  const selectedBondsList = Array.from(selectedBondIds).map(id => bonds.find(b => b.id === id)).filter(Boolean) as typeof bonds;

  const renderEmptyState = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Molecule Properties</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Formula</span>
            <span className="font-mono text-sm font-semibold text-primary">{formula || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Mol. Weight</span>
            <span className="font-mono text-sm">{weight > 0 ? `${weight.toFixed(2)} g/mol` : '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Atoms</span>
            <span className="font-mono text-sm">{atoms.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bonds</span>
            <span className="font-mono text-sm">{bonds.length}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estimated SMILES</h3>
        <div className="bg-muted p-2 rounded-md font-mono text-xs break-all border border-border text-muted-foreground">
          {smiles || 'No structure'}
        </div>
      </div>
    </div>
  );

  const renderAtomProperties = () => {
    if (selectedAtomsList.length !== 1) {
      return (
        <div className="text-sm text-muted-foreground p-4 text-center">
          {selectedAtomsList.length} atoms selected
        </div>
      );
    }
    
    const atom = selectedAtomsList[0];
    const impH = computeImplicitHydrogens(atom, bonds);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xl font-bold font-mono text-primary shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            {atom.element}
          </div>
          <div>
            <h2 className="text-lg font-semibold m-0 leading-tight">Atom {atom.id.substring(0,4)}</h2>
            <span className="text-xs text-muted-foreground">({atom.x.toFixed(1)}, {atom.y.toFixed(1)})</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Element</span>
            <Badge variant="outline" className="font-mono">{atom.element}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Atomic Mass</span>
            <span className="font-mono text-sm">{ATOMIC_MASSES[atom.element]?.toFixed(3) || '-'}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">Formal Charge</span>
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 rounded bg-muted hover:bg-accent flex items-center justify-center text-xs" onClick={() => updateAtom(atom.id, { charge: atom.charge - 1 })}>-</button>
              <span className="font-mono text-sm w-4 text-center">{atom.charge > 0 ? `+${atom.charge}` : atom.charge}</span>
              <button className="w-6 h-6 rounded bg-muted hover:bg-accent flex items-center justify-center text-xs" onClick={() => updateAtom(atom.id, { charge: atom.charge + 1 })}>+</button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Implicit H</span>
            <span className="font-mono text-sm">{impH}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBondProperties = () => {
    if (selectedBondsList.length !== 1) return null;
    const bond = selectedBondsList[0];
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bond Properties</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline" className="capitalize">{bond.type}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order</span>
              <span className="font-mono text-sm">{bond.order}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 h-full bg-card border-l border-border shrink-0 flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.1)]">
      <div className="p-3 bg-muted/30 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspector</span>
      </div>
      
      <ScrollArea className="flex-1 p-5">
        {selectedAtomIds.size === 0 && selectedBondIds.size === 0 
          ? renderEmptyState() 
          : (
            <>
              {selectedAtomIds.size > 0 && renderAtomProperties()}
              {selectedAtomIds.size > 0 && selectedBondIds.size > 0 && <Separator className="my-6" />}
              {selectedBondIds.size > 0 && renderBondProperties()}
            </>
          )}
      </ScrollArea>
    </div>
  );
}
