import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../state/useEditorStore";
import { CPK_COLORS, ATOMIC_RADII } from "../utils/chemistry";

export function Canvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { atoms, bonds } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d1117");

    // Add grid
    // const gridHelper = new THREE.GridHelper(100, 100, 0x30363d, 0x21262d);
    // gridHelper.position.y = -20;
    // scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    // Center camera on molecule
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;
    if (atoms.length > 0) {
      minX = Math.min(...atoms.map((a) => a.x));
      maxX = Math.max(...atoms.map((a) => a.x));
      minY = Math.min(...atoms.map((a) => a.y));
      maxY = Math.max(...atoms.map((a) => a.y));
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    camera.position.set(centerX, centerY, 300);
    camera.lookAt(centerX, centerY, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Build molecule geometry
    const atomGroup = new THREE.Group();

    // Z-coordinates (simple heuristic for 3D look)
    // const atomZ: Record<string, number> = {};
    //atoms.forEach((a) => (atomZ[a.id] = (Math.random() - 0.5) * 10)); // slightly staggered for now

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);

    atoms.forEach((atom) => {
      const color = CPK_COLORS[atom.element] || "#ffffff";
      const radius = (ATOMIC_RADII[atom.element] || 1.0) * 8; // Scale up for visual

      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.2,
      });

      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.scale.set(radius, radius, radius);
      sphere.position.set(atom.x, atom.y, atom.z || 0);

      atomGroup.add(sphere);
    });

    bonds.forEach((bond) => {
      const a1 = atoms.find((a) => a.id === bond.fromAtomId);
      const a2 = atoms.find((a) => a.id === bond.toAtomId);
      if (!a1 || !a2) return;

      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z || 0);
      const p2 = new THREE.Vector3(a2.x, a2.y, a2.z || 0);

      const distance = p1.distanceTo(p2);
      const midpoint = p1.clone().lerp(p2, 0.5);

      const material = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.5,
      });

      // For double/triple bonds, we could add multiple cylinders offset by normal vector
      // For this sandbox, we'll draw one thicker cylinder for order > 1
      const thickness = bond.order > 1 ? 4 : 2;

      const cylinder = new THREE.Mesh(cylinderGeometry, material);
      cylinder.scale.set(thickness, distance, thickness);
      cylinder.position.copy(midpoint);
      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        p2.clone().sub(p1).normalize(),
      );

      atomGroup.add(cylinder);
    });

    // Rotate slightly for a 3D feel
    atomGroup.rotation.x = 0.2;
    atomGroup.rotation.y = 0.2;

    scene.add(atomGroup);

    // Simple interaction (rotation)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: e.offsetX - previousMousePosition.x,
          y: e.offsetY - previousMousePosition.y,
        };

        atomGroup.rotation.y += deltaMove.x * 0.01;
        atomGroup.rotation.x += deltaMove.y * 0.01;
      }
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mouseleave", onMouseUp);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [atoms, bonds]);

  return <div ref={containerRef} className="w-full h-full cursor-move" />;
}
