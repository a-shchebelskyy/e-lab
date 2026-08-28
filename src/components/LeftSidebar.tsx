import React from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { CPK_COLORS } from '../utils/chemistry';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';

const COMMON_ATOMS = ['C', 'H', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I'];
const METAL_ATOMS = ['Na', 'K', 'Li', 'Mg', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Pt', 'Hg', 'Al', 'Pb', 'Si', 'B'];

export function LeftSidebar() {
  const { 
    activeTool, setActiveTool, 
    activeAtomElement, setActiveAtomElement,
    activeBondType, setActiveBondType,
    activeGroupType, setActiveGroupType
  } = useEditorStore();

  const renderAtomButton = (el: string) => {
    const isActive = activeAtomElement === el;
    const color = CPK_COLORS[el] || '#FFFFFF';
    
    return (
      <button
        key={el}
        className={`w-10 h-10 flex items-center justify-center rounded-md font-mono font-bold text-sm transition-all border ${
          isActive 
            ? 'bg-muted border-primary text-primary shadow-[0_0_10px_rgba(45,212,191,0.2)]' 
            : 'bg-card border-border text-foreground hover:bg-accent'
        }`}
        onClick={() => setActiveAtomElement(el)}
        style={{ color: isActive ? color : 'inherit' }}
      >
        <span style={{ color: isActive ? '' : color }} className="opacity-90">{el}</span>
      </button>
    );
  };

  const renderBondButton = (type: string, label: string, icon: React.ReactNode) => {
    const isActive = activeTool === `bond-${type}`;
    return (
      <button
        key={type}
        className={`w-full h-9 flex items-center px-3 space-x-2 rounded-md transition-all ${
          isActive 
            ? 'bg-muted text-primary' 
            : 'bg-transparent text-muted-foreground hover:bg-accent'
        }`}
        onClick={() => {
          setActiveBondType(type as any);
        }}
        title={label}
      >
        <span className="text-xs font-medium">{label}</span>
        <div className="flex justify-start opacity-80">{icon}</div>
      </button>
    );
  };

  const renderGroupButton = (type: string, label: string, icon: React.ReactNode) => {
    const isActive = activeTool === `group-${type}`;
    return (
      <button
        key={type}
        className={`w-full h-9 flex items-center px-3 space-x-2 rounded-md transition-all ${
          isActive 
            ? 'bg-muted text-primary' 
            : 'bg-transparent text-muted-foreground hover:bg-accent'
        }`}
        onClick={() => {
          setActiveGroupType(type as any);
        }}
        title={label}
      >
        <span className="text-xs font-medium">{label}</span>
        <div className="flex justify-start opacity-80">{icon}</div>
      </button>
    );
  };

  return (
    <div className="w-64 h-full bg-card border-r border-border shrink-0 flex flex-col">
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Toolbox</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Bonds */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Bonds</h3>
            <div className="space-y-1">
              {renderBondButton('single', 'Single', <div className="w-[30px] h-[1px] bg-current" />)}
              {renderBondButton('double', 'Double', <div className="flex flex-col gap-0.5"><div className="w-[40px] h-[1px] bg-current" /><div className="w-[40px] h-[1px] bg-current" /></div>)}
              {renderBondButton('triple', 'Triple', <div className="flex flex-col gap-0.5"><div className="w-[40px] h-[1px] bg-current" /><div className="w-[40px] h-[1px] bg-current" /><div className="w-[40px] h-[1px] bg-current" /></div>)}
              {renderBondButton('wedge', 'Wedge', <div className="w-0 h-0 ml-2 border-t-[0px] border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[30px] border-b-current rotate-270 origin-center" />)}
              {renderBondButton('dash', 'Dash', <div className="flex items-center justify-between w-[30px]"><div className="w-[1px] h-[2px] bg-current" /><div className="w-[1px] h-[4px] bg-current" /><div className="w-[1px] h-[6px] bg-current" /><div className="w-[1px] h-[8px] bg-current" /><div className="w-[1px] h-[10px] bg-current" /><div className="w-[1px] h-[12px] bg-current" /></div>)}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Functional Groups */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Functional Groups</h3>
            <div className="space-y-1">
              {renderGroupButton('phenyl', 'Phenyl', <div className="w-4 h-0.5 bg-current" />)}
              {renderGroupButton('aldehyde', 'Aldehyde', <div className="w-4 h-0.5 bg-current" />)}
              {renderGroupButton('ketone', 'Ketone', <div className="w-4 h-0.5 bg-current" />)}
              {renderGroupButton('acid', 'Carboxylic Acid', <div className="w-4 h-0.5 bg-current" />)}
              {renderGroupButton('ester', 'Ester', <div className="w-4 h-0.5 bg-current" />)}
              {renderGroupButton('amide', 'Amide', <div className="w-4 h-0.5 bg-current" />)}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Atoms */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-muted-foreground">Elements</h3>
              <button className="text-xs text-primary hover:underline flex items-center">
                <Search className="w-3 h-3 mr-1" /> All
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {COMMON_ATOMS.map(renderAtomButton)}
            </div>
            
            <h4 className="text-[10px] font-medium text-muted-foreground/60 uppercase mt-4 mb-2">Extended / Metals</h4>
            <div className="grid grid-cols-4 gap-2">
              {METAL_ATOMS.map(renderAtomButton)}
            </div>
          </div>
          
        </div>
      </ScrollArea>
    </div>
  );
}
