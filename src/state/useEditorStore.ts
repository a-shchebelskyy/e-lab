import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Atom, Bond, Group, Annotation, ToolType, Project } from '../types';
import { PREBUILT_MOLECULES } from '../utils/ringTemplates';

export interface DisplayOptions {
  showGrid: boolean;
  snapToGrid: boolean;
  showHydrogens: boolean;
  showSkeleton: boolean;
  showBondAngles: boolean;
  showFormalCharges: boolean;
  theme: 'dark' | 'light';
}

export interface EditorState {
  atoms: Atom[];
  bonds: Bond[];
  annotations: Annotation[];
  
  selectedAtomIds: Set<string>;
  selectedBondIds: Set<string>;
  
  activeTool: ToolType;
  activeAtomElement: string;
  activeBondType: Bond['type'];
  activeGroupType: string;
  
  viewMode: '2d' | '3d';
  displayOptions: DisplayOptions;
  
  camera: { x: number; y: number; zoom: number };
  
  history: { past: Omit<EditorState, 'history'>[], future: Omit<EditorState, 'history'>[] };
  
  // Actions
  addAtom: (atom: Atom) => void;
  updateAtom: (id: string, updates: Partial<Atom>) => void;
  removeAtom: (id: string) => void;
  addBond: (bond: Bond) => void;
  updateBond: (id: string, updates: Partial<Bond>) => void;
  removeBond: (id: string) => void;
  
  setSelection: (atomIds: string[], bondIds: string[]) => void;
  clearSelection: () => void;
  toggleSelection: (id: string, type: 'atom'|'bond') => void;
  
  setActiveTool: (tool: ToolType) => void;
  setActiveAtomElement: (el: string) => void;
  setActiveBondType: (type: Bond['type']) => void;
  setActiveGroupType: (type: string) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setDisplayOptions: (opts: Partial<DisplayOptions>) => void;
  
  setCamera: (updates: Partial<{ x: number; y: number; zoom: number }>) => void;
  
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  loadProject: (project: Project | { atoms: Atom[], bonds: Bond[] }) => void;
  newProject: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      atoms: [],
      bonds: [],
      annotations: [],
      
      selectedAtomIds: new Set<string>(),
      selectedBondIds: new Set<string>(),
      
      activeTool: 'bond-single',
      activeAtomElement: 'C',
      activeBondType: 'single',
      activeGroupType: 'phenyl',
      
      viewMode: '2d',
      displayOptions: {
        showGrid: true,
        snapToGrid: true,
        showHydrogens: true,
        showSkeleton: true,
        showBondAngles: true,
        showFormalCharges: true,
        theme: 'dark'
      },
      
      camera: { x: 0, y: 0, zoom: 1 },
      
      history: { past: [], future: [] },
      
      saveHistory: () => {
        set((state) => {
          const currentState = {
            atoms: state.atoms,
            bonds: state.bonds,
            annotations: state.annotations,
            selectedAtomIds: state.selectedAtomIds,
            selectedBondIds: state.selectedBondIds,
            activeTool: state.activeTool,
            activeAtomElement: state.activeAtomElement,
            activeBondType: state.activeBondType,
            activeGroupType: state.activeGroupType,
            viewMode: state.viewMode,
            displayOptions: state.displayOptions,
            camera: state.camera
          };
          state.history.past.push(currentState);
          if (state.history.past.length > 50) {
            state.history.past.shift(); // Max 50 history steps
          }
          state.history.future = [];
        });
      },
      
      undo: () => {
        set((state) => {
          if (state.history.past.length === 0) return;
          const previous = state.history.past.pop()!;
          const current = {
            atoms: state.atoms,
            bonds: state.bonds,
            annotations: state.annotations,
            selectedAtomIds: state.selectedAtomIds,
            selectedBondIds: state.selectedBondIds,
            activeTool: state.activeTool,
            activeAtomElement: state.activeAtomElement,
            activeBondType: state.activeBondType,
            activeGroupType: state.activeGroupType,
            viewMode: state.viewMode,
            displayOptions: state.displayOptions,
            camera: state.camera
          };
          state.history.future.push(current);
          Object.assign(state, previous);
        });
      },
      
      redo: () => {
        set((state) => {
          if (state.history.future.length === 0) return;
          const next = state.history.future.pop()!;
          const current = {
            atoms: state.atoms,
            bonds: state.bonds,
            annotations: state.annotations,
            selectedAtomIds: state.selectedAtomIds,
            selectedBondIds: state.selectedBondIds,
            activeTool: state.activeTool,
            activeAtomElement: state.activeAtomElement,
            activeBondType: state.activeBondType,
            activeGroupType: state.activeGroupType,
            viewMode: state.viewMode,
            displayOptions: state.displayOptions,
            camera: state.camera
          };
          state.history.past.push(current);
          Object.assign(state, next);
        });
      },
      
      addAtom: (atom) => {
        get().saveHistory();
        set(state => { state.atoms.push(atom) });
      },
      
      updateAtom: (id, updates) => {
        get().saveHistory();
        set(state => {
          const atom = state.atoms.find(a => a.id === id);
          if (atom) Object.assign(atom, updates);
        });
      },
      
      removeAtom: (id) => {
        get().saveHistory();
        set(state => {
          state.atoms = state.atoms.filter(a => a.id !== id);
          state.bonds = state.bonds.filter(b => b.fromAtomId !== id && b.toAtomId !== id);
          state.selectedAtomIds.delete(id);
        });
      },
      
      addBond: (bond) => {
        get().saveHistory();
        set(state => {
          // Check if bond already exists between these two atoms
          const existing = state.bonds.find(b => 
            (b.fromAtomId === bond.fromAtomId && b.toAtomId === bond.toAtomId) ||
            (b.fromAtomId === bond.toAtomId && b.toAtomId === bond.fromAtomId)
          );
          if (existing) {
             existing.order = bond.order;
             existing.type = bond.type;
          } else {
             state.bonds.push(bond);
          }
        });
      },
      
      updateBond: (id, updates) => {
        get().saveHistory();
        set(state => {
          const bond = state.bonds.find(b => b.id === id);
          if (bond) Object.assign(bond, updates);
        });
      },
      
      removeBond: (id) => {
        get().saveHistory();
        set(state => {
          state.bonds = state.bonds.filter(b => b.id !== id);
          state.selectedBondIds.delete(id);
        });
      },
      
      setSelection: (atomIds, bondIds) => set(state => {
        state.selectedAtomIds = new Set(atomIds);
        state.selectedBondIds = new Set(bondIds);
      }),
      
      clearSelection: () => set(state => {
        state.selectedAtomIds.clear();
        state.selectedBondIds.clear();
      }),
      
      toggleSelection: (id, type) => set(state => {
        if (type === 'atom') {
          if (state.selectedAtomIds.has(id)) state.selectedAtomIds.delete(id);
          else state.selectedAtomIds.add(id);
        } else {
          if (state.selectedBondIds.has(id)) state.selectedBondIds.delete(id);
          else state.selectedBondIds.add(id);
        }
      }),
      
      setActiveTool: (tool) => set({ activeTool: tool }),
      setActiveAtomElement: (el) => set({ activeAtomElement: el }),
      setActiveBondType: (type) => {
        set({ activeBondType: type });
        if (['single', 'double', 'triple', 'aromatic', 'wedge', 'dash'].includes(type)) {
          set({ activeTool: `bond-${type}` as ToolType });
        }
      },
      setActiveGroupType: (type) => {
        set({ activeGroupType: type });
        if (['phenyl', 'aldehyde', 'ketone', 'acid', 'ester', 'amide'].includes(type)) {
          set({ activeTool: `group-${type}` as ToolType });
        }
      },
      setViewMode: (mode) => set({ viewMode: mode }),
      setDisplayOptions: (opts) => set(state => { Object.assign(state.displayOptions, opts) }),
      setCamera: (updates) => set(state => { Object.assign(state.camera, updates) }),
      
      loadProject: (project) => {
        get().saveHistory();
        set(state => {
          state.atoms = project.atoms as Atom[];
          state.bonds = project.bonds as Bond[];
          state.annotations = 'annotations' in project ? project.annotations : [];
          state.selectedAtomIds.clear();
          state.selectedBondIds.clear();
          state.camera = { x: 0, y: 0, zoom: 1 };
        });
      },
      
      newProject: () => {
        get().saveHistory();
        set(state => {
          state.atoms = [];
          state.bonds = [];
          state.annotations = [];
          state.selectedAtomIds.clear();
          state.selectedBondIds.clear();
        });
      }
    }))
  )
);
