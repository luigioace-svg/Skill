import { useEffect, useRef, useState } from 'react';
import { Maximize2, Move3d, Rotate3d, ZoomIn, ZoomOut } from 'lucide-react';
import { subjects, subjectById } from '@/data/knowledge';

type Point3D = { x: number; y: number; z: number };
type ProjectedNode = { id: string; x: number; y: number; radius: number; depth: number };

const positions: Record<string, Point3D> = {
  'research-foundations': { x: -3.2, y: 0, z: 0 },
  'game-data': { x: -1.7, y: -1.7, z: 1.1 },
  'link-research': { x: -1.8, y: 1.65, z: -1.1 },
  'ai-research': { x: -.25, y: .15, z: 1.65 },
  'video-annotation': { x: .2, y: -2.25, z: -.8 },
  'recruitment': { x: .55, y: 2.15, z: -1.3 },
  'news-verification': { x: 1.55, y: .25, z: .75 },
  'documentary-research': { x: 3.2, y: -1.45, z: -1 },
  'gtm-automation': { x: 3.3, y: 1.55, z: 1.15 },
};

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

export default function SkillUniverse3D({ completed, onOpenSubject }: { completed: Set<string>; onOpenSubject: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const projectedRef = useRef<ProjectedNode[]>([]);
  const rotationRef = useRef({ yaw: -.28, pitch: -.12 });
  const zoomRef = useRef(1);
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState('research-foundations');
  const [isDragging, setIsDragging] = useState(false);
  const selected = subjectById[selectedId];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const project = (point: Point3D, width: number, height: number) => {
      const { yaw, pitch } = rotationRef.current;
      const cosY = Math.cos(yaw); const sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch); const sinX = Math.sin(pitch);
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const focal = 8.5;
      const scale = (focal / (focal - z2)) * zoomRef.current * Math.min(width, height) / 10;
      return { x: width / 2 + x1 * scale, y: height / 2 + y1 * scale, depth: z2, scale };
    };

    const draw = (timestamp = 0) => {
      if (timestamp && timestamp - lastFrameRef.current < 33) {
        frameRef.current = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = timestamp;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, rect.width); const height = Math.max(1, rect.height);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const halo = context.createRadialGradient(width * .52, height * .46, 20, width * .52, height * .46, Math.max(width, height) * .65);
      halo.addColorStop(0, 'rgba(226, 191, 132, .15)');
      halo.addColorStop(.48, 'rgba(120, 79, 60, .05)');
      halo.addColorStop(1, 'rgba(31, 24, 24, 0)');
      context.fillStyle = halo; context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = .22;
      for (let gx = 30; gx < width; gx += 42) for (let gy = 26; gy < height; gy += 42) {
        context.beginPath(); context.arc(gx, gy, 1, 0, Math.PI * 2); context.fillStyle = '#d8c09a'; context.fill();
      }
      context.restore();

      const projected = subjects.map((subject) => {
        const point = project(positions[subject.id], width, height);
        return { ...point, id: subject.id, radius: Math.max(25, Math.min(43, point.scale * .62)) };
      });
      projectedRef.current = projected;
      const byId = Object.fromEntries(projected.map((point) => [point.id, point]));

      subjects.forEach((subject) => subject.prerequisites.forEach((pre) => {
        const start = byId[pre]; const end = byId[subject.id];
        if (!start || !end) return;
        const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(216, 192, 154, .25)'); gradient.addColorStop(.5, 'rgba(216, 192, 154, .86)'); gradient.addColorStop(1, 'rgba(184, 111, 82, .34)');
        context.strokeStyle = gradient; context.lineWidth = 1.25;
        context.setLineDash([4, 7]); context.beginPath(); context.moveTo(start.x, start.y); context.lineTo(end.x, end.y); context.stroke(); context.setLineDash([]);
        const pulse = .45 + Math.sin(Date.now() / 900 + subject.order) * .14;
        const px = start.x + (end.x - start.x) * pulse; const py = start.y + (end.y - start.y) * pulse;
        context.beginPath(); context.arc(px, py, 2.6, 0, Math.PI * 2); context.fillStyle = '#e8c991'; context.fill();
      }));

      projected.sort((a, b) => a.depth - b.depth).forEach((point) => {
        const subject = subjectById[point.id];
        const done = subject.lessons.every((lesson) => completed.has(lesson.id));
        const selectedNode = point.id === selectedId;
        const rgb = hexToRgb(subject.accent);
        context.save();
        context.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${selectedNode ? .48 : .25})`;
        context.shadowBlur = selectedNode ? 28 : 15;
        context.beginPath(); context.arc(point.x, point.y, point.radius + (selectedNode ? 8 : 4), 0, Math.PI * 2);
        context.strokeStyle = selectedNode ? '#f0d7a6' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .42)`; context.lineWidth = selectedNode ? 2 : 1; context.stroke();
        const sphere = context.createRadialGradient(point.x - point.radius * .34, point.y - point.radius * .42, 2, point.x, point.y, point.radius);
        sphere.addColorStop(0, done ? '#e7e8d5' : '#fff2d8');
        sphere.addColorStop(.24, done ? '#a2aa7c' : subject.accent);
        sphere.addColorStop(.72, done ? '#68704d' : `rgb(${Math.max(0, rgb.r - 34)}, ${Math.max(0, rgb.g - 34)}, ${Math.max(0, rgb.b - 34)})`);
        sphere.addColorStop(1, '#2e2421');
        context.beginPath(); context.arc(point.x, point.y, point.radius, 0, Math.PI * 2); context.fillStyle = sphere; context.fill();
        context.shadowBlur = 0;
        context.fillStyle = '#fffaf0'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.font = `700 ${Math.max(12, point.radius * .42)}px DM Sans, sans-serif`;
        context.fillText(done ? '✓' : String(subject.order).padStart(2, '0'), point.x, point.y + 1);
        context.font = '600 12px DM Sans, sans-serif'; context.fillStyle = 'rgba(255,250,240,.92)';
        context.fillText(subject.shortTitle, point.x, point.y + point.radius + 19);
        context.restore();
      });

      frameRef.current = window.requestAnimationFrame(draw);
    };
    frameRef.current = window.requestAnimationFrame(draw);
    return () => { if (frameRef.current) window.cancelAnimationFrame(frameRef.current); };
  }, [completed, selectedId]);

  const pickNode = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current; if (!canvas) return null;
    const rect = canvas.getBoundingClientRect(); const x = clientX - rect.left; const y = clientY - rect.top;
    return [...projectedRef.current].sort((a, b) => b.depth - a.depth).find((node) => Math.hypot(node.x - x, node.y - y) <= node.radius + 12)?.id ?? null;
  };

  const resetView = () => { rotationRef.current = { yaw: -.28, pitch: -.12 }; zoomRef.current = 1; };

  return (
    <div className="universe-stage">
      <canvas
        ref={canvasRef}
        className={isDragging ? 'is-dragging' : ''}
        aria-label="Interactive three-dimensional prerequisite network"
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { active: true, moved: false, x: event.clientX, y: event.clientY }; setIsDragging(true); }}
        onPointerMove={(event) => { const drag = dragRef.current; if (!drag.active) return; const dx = event.clientX - drag.x; const dy = event.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; rotationRef.current.yaw += dx * .008; rotationRef.current.pitch = Math.max(-1.1, Math.min(1.1, rotationRef.current.pitch + dy * .006)); drag.x = event.clientX; drag.y = event.clientY; }}
        onPointerUp={(event) => { const drag = dragRef.current; drag.active = false; setIsDragging(false); if (!drag.moved) { const id = pickNode(event.clientX, event.clientY); if (id) setSelectedId(id); } }}
        onDoubleClick={(event) => { const id = pickNode(event.clientX, event.clientY); if (id) onOpenSubject(id); }}
        onWheel={(event) => { event.preventDefault(); zoomRef.current = Math.max(.72, Math.min(1.45, zoomRef.current - event.deltaY * .001)); }}
      />
      <div className="universe-instructions glass-panel"><Move3d size={16} /><span>Drag to rotate</span><ZoomIn size={16} /><span>Scroll to zoom</span><Rotate3d size={16} /><span>Double-tap a node to open</span></div>
      <div className="universe-view-controls">
        <button className="glass-button" onClick={() => { zoomRef.current = Math.max(.72, zoomRef.current - .12); }} aria-label="Zoom out"><ZoomOut size={17} /></button>
        <button className="glass-button universe-reset" onClick={resetView} aria-label="Reset universe view"><Maximize2 size={17} />Reset</button>
        <button className="glass-button" onClick={() => { zoomRef.current = Math.min(1.45, zoomRef.current + .12); }} aria-label="Zoom in"><ZoomIn size={17} /></button>
      </div>
      <aside className="universe-inspector glass-panel" style={{ '--node': selected.accent } as React.CSSProperties}>
        <span className="inspector-index">{selected.order.toString().padStart(2, '0')}</span>
        <div><small>{selected.difficulty} · {selected.hours} hours</small><h2>{selected.title}</h2><p>{selected.description}</p></div>
        <button onClick={() => onOpenSubject(selected.id)}>Enter topic</button>
      </aside>
      <div className="universe-node-controls" aria-label="Select a topic node">
        {subjects.map((subject) => <button key={subject.id} className={selectedId === subject.id ? 'active' : ''} onClick={() => setSelectedId(subject.id)}>{subject.order}</button>)}
      </div>
    </div>
  );
}
