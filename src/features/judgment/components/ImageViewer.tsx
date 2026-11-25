import { Button, Checkbox } from 'antd';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { MaskedImage } from '../../inspections/components/MaskedImage';
import { canShowImage } from '../../inspections/masking';
import type { Device, Inspection } from '../../inspections/types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const PAN_STEP = 40;

interface View { zoom: number; x: number; y: number }
const initialView: View = { zoom: 1, x: 0, y: 0 };

// S-04 본 이미지. 확대·이동·검출 위치·초기화를 버튼과 키보드로도 쓸 수 있다(완료 조건 10·11, 핀치 불필요).
// 마스킹 차단이면 이미지와 함께 모든 조작을 비활성으로 둔다(계획 §4-3).
export function ImageViewer({ item, device }: { item: Inspection; device: Device | undefined }) {
  const [view, setView] = useState<View>(initialView);
  const [showDetections, setShowDetections] = useState(true);
  const drag = useRef<{ id: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const visible = canShowImage(item, device);

  const zoomBy = (delta: number) => setView(current => {
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom + delta));
    return zoom === 1 ? initialView : { ...current, zoom };
  });
  const panBy = (dx: number, dy: number) => setView(current => current.zoom === 1 ? current : { ...current, x: current.x + dx, y: current.y + dy });
  const reset = () => setView(initialView);

  function handleKeyDown(event: KeyboardEvent) {
    const actions: Record<string, () => void> = {
      '+': () => zoomBy(ZOOM_STEP), '=': () => zoomBy(ZOOM_STEP), '-': () => zoomBy(-ZOOM_STEP), '0': reset,
      ArrowLeft: () => panBy(PAN_STEP, 0), ArrowRight: () => panBy(-PAN_STEP, 0), ArrowUp: () => panBy(0, PAN_STEP), ArrowDown: () => panBy(0, -PAN_STEP),
    };
    // 자판 배열에 따라 key 값이 달라질 수 있어 물리 키(code)도 함께 본다.
    const byCode: Record<string, string> = { Equal: '+', NumpadAdd: '+', Minus: '-', NumpadSubtract: '-', Digit0: '0', Numpad0: '0' };
    const action = actions[event.key] ?? actions[byCode[event.code]];
    if (action) { event.preventDefault(); action(); }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (view.zoom === 1) return;
    drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    setView(value => ({ ...value, x: current.x + event.clientX - current.startX, y: current.y + event.clientY - current.startY }));
  }
  const endDrag = () => { drag.current = null; };

  return (
    <div className="image-viewer">
      {visible ? (
        <div
          className={`viewer-viewport ${view.zoom > 1 ? 'zoomed' : ''}`}
          tabIndex={0}
          role="group"
          aria-label={`약포지 이미지 · 확대 ${view.zoom}배. +와 - 키로 확대·축소, 방향키로 이동, 0 키로 초기화`}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="viewer-canvas" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
            <MaskedImage item={item} device={device} />
            {showDetections && item.detections.map((box, index) => (
              <span
                key={index}
                className="detection-box"
                aria-hidden="true"
                style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <MaskedImage item={item} device={device} />
      )}
      <div className="viewer-toolbar" aria-label="이미지 조작">
        <Button onClick={() => zoomBy(ZOOM_STEP)} disabled={!visible || view.zoom >= MAX_ZOOM} aria-label="확대">확대 +</Button>
        <Button onClick={() => zoomBy(-ZOOM_STEP)} disabled={!visible || view.zoom <= MIN_ZOOM} aria-label="축소">축소 −</Button>
        <span className="pan-buttons">
          <Button onClick={() => panBy(PAN_STEP, 0)} disabled={!visible || view.zoom === 1} aria-label="왼쪽으로 이동">←</Button>
          <Button onClick={() => panBy(0, PAN_STEP)} disabled={!visible || view.zoom === 1} aria-label="위로 이동">↑</Button>
          <Button onClick={() => panBy(0, -PAN_STEP)} disabled={!visible || view.zoom === 1} aria-label="아래로 이동">↓</Button>
          <Button onClick={() => panBy(-PAN_STEP, 0)} disabled={!visible || view.zoom === 1} aria-label="오른쪽으로 이동">→</Button>
        </span>
        <Button onClick={reset} disabled={!visible}>초기화</Button>
        <Checkbox className="touch-checkbox" checked={showDetections && visible} disabled={!visible || item.detections.length === 0} onChange={event => setShowDetections(event.target.checked)}>
          검출 위치 표시
        </Checkbox>
        <span className="muted small" aria-live="polite">{visible ? `확대 ${view.zoom}배` : '이미지가 차단돼 조작할 수 없습니다'}</span>
      </div>
    </div>
  );
}
