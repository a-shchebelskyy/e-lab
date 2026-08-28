import React from 'react';
import { useEditorStore } from '../state/useEditorStore';
import { PREBUILT_MOLECULES } from '../utils/ringTemplates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Beaker, FileBox, Hexagon } from 'lucide-react';

export function WelcomeScreen({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { loadProject, newProject } = useEditorStore();

  const handleTemplate = (key: keyof typeof PREBUILT_MOLECULES) => {
    loadProject(PREBUILT_MOLECULES[key]);
    onOpenChange(false);
  };

  const handleBlank = () => {
    newProject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border-primary/20 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-mono font-bold tracking-tight text-primary m-0">Vector E-Lab</DialogTitle>
              <DialogDescription className="text-xs font-mono m-0 mt-1">Molecular Modeling & Chemistry Sandbox</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 mt-2">
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start space-x-4 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => handleTemplate('benzene')}
          >
            <Hexagon className="w-6 h-6 text-muted-foreground" />
            <div className="text-left">
              <div className="font-semibold text-foreground">Start with Benzene</div>
              <div className="text-xs text-muted-foreground">Load a basic aromatic ring</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start space-x-4 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => handleTemplate('caffeine')}
          >
            <Beaker className="w-6 h-6 text-muted-foreground" />
            <div className="text-left">
              <div className="font-semibold text-foreground">Start with Caffeine</div>
              <div className="text-xs text-muted-foreground">Load a complex multi-ring structure</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start space-x-4 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={handleBlank}
          >
            <FileBox className="w-6 h-6 text-muted-foreground" />
            <div className="text-left">
              <div className="font-semibold text-foreground">Blank Canvas</div>
              <div className="text-xs text-muted-foreground">Start from scratch</div>
            </div>
          </Button>
        </div>
        
        <div className="text-[10px] text-center text-muted-foreground font-mono mt-2">
          Use the left sidebar to select tools.<br/>Click to place atoms. Drag to draw bonds.
        </div>
      </DialogContent>
    </Dialog>
  );
}
