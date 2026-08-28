import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightInspector } from './components/RightInspector';
import { StatusBar } from './components/StatusBar';
import { Canvas2D } from './components/Canvas2D';
import { Canvas3D } from './components/Canvas3D';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useEditorStore } from './state/useEditorStore';

const queryClient = new QueryClient();

function EditorLayout() {
  const { viewMode } = useEditorStore();
  const [showWelcome, setShowWelcome] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useEditorStore.getState();
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
           e.preventDefault();
           if (e.shiftKey) store.redo();
           else store.undo();
        }
        if (e.key === 'y') {
           e.preventDefault();
           store.redo();
        }
      } else {
        if (e.key === 'q') store.setActiveTool('select');
        if (e.key === ' ') {
          e.preventDefault();
          store.setActiveTool('pan');
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Delete selected
          store.selectedAtomIds.forEach(id => store.removeAtom(id));
          store.selectedBondIds.forEach(id => store.removeBond(id));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      <WelcomeScreen open={showWelcome} onOpenChange={setShowWelcome} />

      <TopBar />
      <Toolbar />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        
        <main className="flex-1 relative flex flex-col min-w-0">
          {viewMode === '2d' ? <Canvas2D /> : <Canvas3D />}
        </main>
        
        <RightInspector />
      </div>
      
      <StatusBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EditorLayout />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
