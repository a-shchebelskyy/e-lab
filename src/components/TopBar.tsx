import React from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { 
  File, FolderOpen, Save, Undo, Redo, Scissors, Copy, ClipboardPaste, 
  Trash2, MousePointer2, Move, Ruler, Grid3X3, Settings, Moon, Sun, FolderDown, FolderUp,
  Download, Type
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export function TopBar() {
  const { 
    viewMode, setViewMode, activeTool, setActiveTool, undo, redo, 
    displayOptions, setDisplayOptions, history, newProject
  } = useEditorStore();

  const handleExportJson = () => {
    const { atoms, bonds, annotations } = useEditorStore.getState();
    const data = JSON.stringify({ atoms, bonds, annotations }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'molecule.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    const svgEl = document.getElementById('canvas-2d-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'molecule.svg';
    a.click();
  };

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-card border-b border-border shadow-sm shrink-0 z-10">
      <div className="flex items-center space-x-1">
        <div className="font-mono font-bold text-primary mr-4 tracking-tight flex items-center">
          <span className="text-xl">V</span>
          <span className="text-sm opacity-80 ml-0.5">ECTOR E-LAB</span>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={newProject}><File className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>New Project</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={newProject}><FolderDown className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Import Project</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleExportJson}><FolderUp className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Export Project</TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={undo} disabled={history.past.length === 0}><Undo className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={redo} disabled={history.future.length === 0}><Redo className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
             <Toggle 
               pressed={displayOptions.theme === 'dark'} 
               onPressedChange={() => setDisplayOptions({ theme: displayOptions.theme === 'dark' ? 'light' : 'dark' })}>
               {displayOptions.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>

        {/* <Button variant="outline" size="sm" onClick={handleExportSvg} className="ml-4 border-primary/50 text-primary hover:bg-primary/10">
          Export SVG
        </Button> */}
      </div>
    </div>
  );
}
