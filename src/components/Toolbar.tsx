import React from "react";
import { useEditorStore } from "../state/useEditorStore";
import {
  Scissors,
  Copy,
  ClipboardPaste,
  MousePointer2,
  VectorSquare,
  Move,
  RefreshCw,
  Eraser,
  Ruler,
  Grid3X3,
  Magnet,
  Bone,
  Settings,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export function Toolbar() {
  const {
    viewMode,
    setViewMode,
    activeTool,
    setActiveTool,
    undo,
    redo,
    displayOptions,
    setDisplayOptions,
    history,
    newProject,
  } = useEditorStore();

  const handleExportJson = () => {
    const { atoms, bonds, annotations } = useEditorStore.getState();
    const data = JSON.stringify({ atoms, bonds, annotations }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "molecule.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    const svgEl = document.getElementById("canvas-2d-svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const a = document.createElement("a");
    a.href = url;
    a.download = "molecule.svg";
    a.click();
  };

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-card border-b border-border shadow-sm shrink-0 z-10">
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "select"}
              onPressedChange={() => setActiveTool("select")}
              aria-label="Select"
              className={`${activeTool === "select" ? "bg-muted" : ""}`}
            >
              <MousePointer2 className={`h-4 w-4 ${activeTool === "select" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Select (Q)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "rect-select"}
              onPressedChange={() => setActiveTool("rect-select")}
              aria-label="Rectangle Select"
              className={`${activeTool === "rect-select" ? "bg-muted" : ""}`}
            >
              <VectorSquare className={`h-4 w-4 ${activeTool === "rect-select" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Rectangle Select (W)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "pan"}
              onPressedChange={() => setActiveTool("pan")}
              aria-label="Pan"
              className={`${activeTool === "pan" ? "bg-muted" : ""}`}
            >
              <Move className={`h-4 w-4 ${activeTool === "pan" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Pan (Space)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "pan"}
              onPressedChange={() => setActiveTool("pan")}
              aria-label="Rotate"
              className={`${activeTool === "pan" ? "bg-muted" : ""}`}
            >
              <RefreshCw className={`h-4 w-4 ${activeTool === "pan" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Rotate (R)</TooltipContent>
        </Tooltip>

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Toggle pressed={activeTool === 'measure'} onPressedChange={() => setActiveTool('measure')} aria-label="Measure">
              <Ruler className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Measure (T)</TooltipContent>
        </Tooltip> */}

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "select"}
              onPressedChange={() => setActiveTool("select")}
              aria-label="Cut"
              className={`${activeTool === "select" ? "bg-muted" : ""}`}
            >
              <Scissors className={`h-4 w-4 ${activeTool === "select" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Cut (Ctrl + X)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "select"}
              onPressedChange={() => setActiveTool("select")}
              aria-label="Copy"
              className={`${activeTool === "select" ? "bg-muted" : ""}`}
            >
              <Copy className={`h-4 w-4 ${activeTool === "select" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Copy (Ctrl + C)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "rect-select"}
              onPressedChange={() => setActiveTool("rect-select")}
              aria-label="Paste"
              className={`${activeTool === "rect-select" ? "bg-muted" : ""}`}
            >
              <ClipboardPaste className={`h-4 w-4 ${activeTool === "rect-select" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Paste (Ctrl + V)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={activeTool === "erase"}
              onPressedChange={() => setActiveTool("erase")}
              aria-label="Eraser"
              className={`${activeTool === "erase" ? "bg-muted" : ""}`}
            >
              <Eraser className={`h-4 w-4 ${activeTool === "erase" ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Eraser (E)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Toggle pressed={displayOptions.showBondAngles} onPressedChange={(v) => setDisplayOptions({ showBondAngles: v })}>
              <TriangleRight className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle Bond Angles</TooltipContent>
        </Tooltip> */}

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={displayOptions.showHydrogens}
              onPressedChange={(v) => setDisplayOptions({ showHydrogens: v })}
            >
              <Heading className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle Hydrogens</TooltipContent>
        </Tooltip> */}

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={displayOptions.showSkeleton}
              onPressedChange={(v) => setDisplayOptions({ showSkeleton: v })}
              className={`${displayOptions.showSkeleton ? "bg-muted" : ""}`}
            >
              <Bone className={`h-4 w-4 ${displayOptions.showSkeleton ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle Skeletal Struture</TooltipContent>
        </Tooltip> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={displayOptions.snapToGrid}
              onPressedChange={(v) => setDisplayOptions({ snapToGrid: v })}
              className={`${displayOptions.snapToGrid ? "bg-muted" : ""}`}
            >
              <Magnet className={`h-4 w-4 ${displayOptions.snapToGrid ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Snap to Grid</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={displayOptions.showGrid}
              onPressedChange={(v) => setDisplayOptions({ showGrid: v })}
              className={`${displayOptions.showGrid ? "bg-muted" : ""}`}
            >
              <Grid3X3 className={`h-4 w-4 ${displayOptions.showGrid ? "text-primary" : ""}`} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle Grid</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
