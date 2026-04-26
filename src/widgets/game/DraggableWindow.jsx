import { useState, useEffect, useRef, useCallback } from "react";
import { WIN_CONSTRAINTS } from "@/widgets/game/gameConstants";

/**
 * DraggableWindow
 * - Desktop: draggable + resizable
 * - Mobile/Tablet: fixed layout, no drag/resize
 * - Optional color picker button (showColorPicker prop)
 * - Yellow hide button
 */
export default function DraggableWindow({
  id,
  title,
  color,
  children,
  defaultPos,
  defaultSize,
  hidden,
  onHide,
  showColorPicker = false,
  pickerColors = [],
  currentBg,
  onBgChange,
  // mobile/tablet fixed layout props
  className = "",
  style = {},
}) {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  const constraints = WIN_CONSTRAINTS[id] || { minW: 150, maxW: 600, minH: 100, maxH: 600 };

  const [pos, setPos]         = useState(defaultPos || { x: 20, y: 20 });
  const [size, setSize]       = useState(defaultSize || { w: constraints.minW + 60, h: "auto" });
  const [dragging, setDragging]   = useState(false);
  const [resizing, setResizing]   = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const dragOffset  = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });
  const windowRef   = useRef(null);

  // ── Drag (desktop only) ──────────────────────────────────────
  const onTitleMouseDown = useCallback((e) => {
    if (!isDesktop) return;
    if (e.target.closest(".no-drag")) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos, isDesktop]);

  // ── Resize handle (desktop only) ────────────────────────────
  const onResizeMouseDown = useCallback((e) => {
    if (!isDesktop) return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    setResizing(true);
    resizeStart.current = {
      mx: e.clientX,
      my: e.clientY,
      w: rect.width,
      h: rect.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, [isDesktop]);

  useEffect(() => {
    if (!dragging && !resizing) return;

    const onMove = (e) => {
      if (dragging) {
        setPos({
          x: Math.max(0, e.clientX - dragOffset.current.x),
          y: Math.max(0, e.clientY - dragOffset.current.y),
        });
      }
      if (resizing) {
        const dx = e.clientX - resizeStart.current.mx;
        const dy = e.clientY - resizeStart.current.my;
        const newW = Math.min(constraints.maxW, Math.max(constraints.minW, resizeStart.current.w + dx));
        const newH = Math.min(constraints.maxH, Math.max(constraints.minH, resizeStart.current.h + dy));
        setSize({ w: newW, h: newH });
      }
    };

    const onUp = () => { setDragging(false); setResizing(false); };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, constraints]);

  if (hidden) return null;

  // ── Styles: desktop = absolute positioned, mobile = static ──
  const containerStyle = isDesktop
    ? {
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size.w,
        ...(size.h !== "auto" ? { height: size.h } : {}),
        zIndex: 10,
        ...style,
      }
    : {
        position: "relative",
        width: "100%",
        ...style,
      };

  return (
    <div ref={windowRef} className={`select-none ${className}`} style={containerStyle}>
      <div
        style={{
          background: color.bg,
          border: "3px solid #111",
          borderRadius: 16,
          boxShadow: "4px 4px 0px #111",
          overflow: "visible",
          fontFamily: "'Press Start 2P', monospace",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Title bar ── */}
        <div
          className={`flex items-center gap-2 px-3 py-2 ${isDesktop ? "cursor-grab active:cursor-grabbing" : ""}`}
          style={{
            background: color.title,
            borderBottom: "3px solid #111",
            userSelect: "none",
            borderRadius: "13px 13px 0 0",
            flexShrink: 0,
          }}
          onMouseDown={onTitleMouseDown}
        >
          {/* Yellow hide button */}
          <button
            className="no-drag w-4 h-4 rounded-full border-2 border-black hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ background: "#ffd43b" }}
            onClick={onHide}
            title="Hide window"
          />

          <span className="text-black flex-1 truncate" style={{ fontSize: 8, letterSpacing: 0.5 }}>
            {title}
          </span>

          {/* Color picker button */}
          {showColorPicker && (
            <div className="no-drag relative">
              <button
                className="w-5 h-5 rounded-full border-2 border-black hover:scale-110 transition-transform flex-shrink-0"
                style={{ background: currentBg || "#fff8f8" }}
                onClick={(e) => { e.stopPropagation(); setShowPicker((p) => !p); }}
                title="Change background color"
              />
              {showPicker && (
                <div
                  className="absolute top-7 right-0 z-50 flex gap-1 flex-wrap p-2"
                  style={{
                    background: "#fffde7",
                    border: "2px solid #111",
                    borderRadius: 10,
                    boxShadow: "3px 3px 0 #111",
                    width: 110,
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {pickerColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { onBgChange(c); setShowPicker(false); }}
                      className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{
                        background: c,
                        borderColor: currentBg === c ? "#111" : "#ccc",
                        boxShadow: currentBg === c ? "0 0 0 2px #ffd43b" : "none",
                      }}
                      title={c}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div
          className="p-3 flex-1"
          style={{ overflow: size.h !== "auto" ? "hidden" : "visible" }}
        >
          {children}
        </div>

        {/* ── Resize handle (desktop only, bottom-right) ── */}
        {isDesktop && (
          <div
            onMouseDown={onResizeMouseDown}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 18,
              height: 18,
              cursor: "se-resize",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              padding: 3,
              zIndex: 20,
            }}
          >
            {/* Resize grip dots */}
            <svg width="10" height="10" viewBox="0 0 10 10">
              <circle cx="8" cy="8" r="1.5" fill="#555" />
              <circle cx="4" cy="8" r="1.5" fill="#555" />
              <circle cx="8" cy="4" r="1.5" fill="#555" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}