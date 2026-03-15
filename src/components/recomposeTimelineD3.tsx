import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

export type RecomposeItemInfo = {
    clipId: string;
    videoId: string;
    title: string;
    start: number;
    end: number | null;
    tags?: string[];
    note?: string;
    duration: number;
};

type Props = {
    clips: RecomposeItemInfo[];
    currentIndex: number;
    currentTime?: number;
    onSelectClip: (index: number) => void;
    onReorderClips: (dragIndex: number, dropIndex: number) => void;
    onDragStartTimeline?: () => void;
    onScrub?: (index: number, time: number) => void;
    height?: number;
};

export default function RecomposeTimelineD3({
    clips,
    currentIndex,
    currentTime = 0,
    onSelectClip,
    onReorderClips,
    onDragStartTimeline,
    onScrub,
    height = 90,
}: Props) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const layoutClips = useMemo(() => {
        let x = 0;
        return clips.map((clip, i) => {
            const width = Math.max(50, Math.min(250, clip.duration * 5));
            const info = { ...clip, index: i, x, width };
            x += width + 4;
            return info;
        });
    }, [clips]);

    const totalWidth = layoutClips.length ? layoutClips[layoutClips.length - 1].x + layoutClips[layoutClips.length - 1].width : 0;

    // Structural Draw (Clips, Scrubber background, Playhead)
    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl || layoutClips.length === 0) return;

        const margin = { top: 12, right: 12, bottom: 24, left: 12 };
        const innerH = height - margin.top - margin.bottom;
        const clipH = innerH - 14; // Leave room at the bottom for scrub track

        const svg = d3.select(svgEl);
        svg.selectAll("*").remove();

        svg
            .attr("viewBox", `0 0 ${totalWidth + margin.left + margin.right} ${height}`)
            .style("width", `${totalWidth + margin.left + margin.right}px`)
            .style("height", `${height}px`);

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scrub Track background
        g.append("rect")
            .attr("y", clipH + 6)
            .attr("width", totalWidth)
            .attr("height", 8)
            .attr("rx", 4)
            .attr("fill", "#2d2d2d");

        // Draw clips
        const groups = g.selectAll("g.recompose-clip")
            .data(layoutClips, (d: any) => d.clipId)
            .enter()
            .append("g")
            .attr("class", "recompose-clip")
            .attr("transform", (d) => `translate(${d.x}, 0)`);

        // Clip container rect
        groups.append("rect")
            .attr("class", "clip-bg")
            .attr("width", d => d.width)
            .attr("height", clipH)
            .attr("rx", 6)
            .attr("stroke-width", 2)
            .style("cursor", "grab");

        // Title text
        groups.append("text")
            .text(d => d.title || "Clip")
            .attr("x", 8)
            .attr("y", clipH / 2 + 4)
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .attr("fill", "#fff")
            .style("pointer-events", "none")
            .each(function(d: any) {
                const self = d3.select(this);
                let textLength = self.node()?.getComputedTextLength() || 0;
                let text = self.text();
                while (textLength > d.width - 16 && text.length > 0) {
                    text = text.slice(0, -1);
                    self.text(text + '...');
                    textLength = self.node()?.getComputedTextLength() || 0;
                }
            });

        // Click Event to select
        groups.on("click", (evt, d) => {
            if (evt.defaultPrevented) return;
            onSelectClip(d.index);
        });

        // Add D3 Drag Behavior (for reordering)
        let draggedNode: any = null;
        let dragStartX = 0;

        const drag = d3.drag<any, any>()
            .on("start", function(event, d) {
                onDragStartTimeline?.(); // pause video when dragging boxes
                d3.select(this).raise(); 
                d3.select(this).select(".clip-bg")
                    .style("cursor", "grabbing")
                    .attr("opacity", 0.8);
                draggedNode = this;
                dragStartX = d.x;
            })
            .on("drag", function(event, d) {
                dragStartX += event.dx;
                d3.select(this).attr("transform", `translate(${dragStartX}, 0)`);
                event.sourceEvent.preventDefault();
            })
            .on("end", function(event, d) {
                event.sourceEvent.stopPropagation();
                
                d3.select(this).select(".clip-bg")
                    .style("cursor", "grab")
                    .attr("opacity", 1);
                
                const centerDropX = dragStartX + (d.width / 2);
                let targetIndex = layoutClips.length - 1;
                for (let i = 0; i < layoutClips.length; i++) {
                    const lc = layoutClips[i];
                    if (centerDropX < lc.x + lc.width / 2) {
                        targetIndex = i;
                        break;
                    }
                }
                
                if (targetIndex !== d.index) {
                    onReorderClips(d.index, targetIndex);
                } else {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", `translate(${d.x}, 0)`);
                }
                draggedNode = null;
            });

        groups.call(drag);

        // Playhead Element
        const playhead = g.append("g").attr("class", "playhead").style("pointer-events", "none");
        playhead.append("line")
            .attr("y1", -4)
            .attr("y2", innerH + 4)
            .attr("stroke", "#ff4444")
            .attr("stroke-width", 2);
        playhead.append("polygon")
            .attr("points", "-6,-4 6,-4 0,4")
            .attr("fill", "#ff4444");

        // Scrub Drag (Catch interactions over the timeline track)
        const scrubDrag = d3.drag<any, any>()
            .on("start", () => onDragStartTimeline?.())
            .on("drag", function(event) {
                let px = Math.max(0, Math.min(totalWidth, event.x));
                const target = layoutClips.find(c => px >= c.x && px <= c.x + c.width) || layoutClips[layoutClips.length - 1];
                const progress = clamp((px - target.x) / target.width, 0, 1);
                const time = target.start + progress * target.duration;
                onScrub?.(target.index, time);
            });

        g.append("rect")
            .attr("class", "scrub-overlay")
            .attr("y", clipH)
            .attr("width", totalWidth)
            .attr("height", margin.bottom + 14)
            .attr("fill", "transparent")
            .style("cursor", "crosshair")
            .call(scrubDrag)
            .on("click", (event) => {
                 const [px] = d3.pointer(event, g.node());
                 let safePx = Math.max(0, Math.min(totalWidth, px));
                 const target = layoutClips.find(c => safePx >= c.x && safePx <= c.x + c.width) || layoutClips[layoutClips.length - 1];
                 const progress = clamp((safePx - target.x) / target.width, 0, 1);
                 const time = target.start + progress * target.duration;
                 onScrub?.(target.index, time);
            });

        playhead.raise();

        // Hover Tooltip
        const tooltip = d3.select("body").selectAll(".d3-tooltip").data([0]);
        const ttEnter = tooltip.enter().append("div").attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#333")
            .style("color", "#fff")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", 9999)
            .style("max-width", "300px");
        
        const tt = ttEnter.merge(tooltip as any);

        groups.on("mouseover", function(event, d) {
            if (draggedNode) return; 
            
            const startStr = d.start.toFixed(2);
            const endStr = d.end == null ? "END" : d.end.toFixed(2);
            const durStr = d.duration.toFixed(2);
            const tagsStr = (d.tags && d.tags.length) ? `<br/><span style="color:#A6C7A4">Tags: ${d.tags.join(", ")}</span>` : "";
            
            tt.html(`
                <div style="font-weight:700;margin-bottom:4px;">${d.title || 'Untitled'}</div>
                <div>${d.videoId} &bull; ${startStr}s &rarr; ${endStr}s (${durStr}s)</div>
                ${d.note ? `<div style="margin-top:4px;font-style:italic;">${d.note}</div>` : ""}
                ${tagsStr}
            `);
            tt.style("visibility", "visible");
        })
        .on("mousemove", function(event) {
            tt.style("top", (event.pageY + 15) + "px")
              .style("left", (event.pageX + 15) + "px");
        })
        .on("mouseout", function() {
            tt.style("visibility", "hidden");
        });

        return () => {
            tt.style("visibility", "hidden");
        };

    }, [layoutClips, height, onSelectClip, onReorderClips, onDragStartTimeline, onScrub, totalWidth]);

    // Dynamic Draw (Colors + Playhead Position at 60fps)
    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl || layoutClips.length === 0) return;
        const svg = d3.select(svgEl);

        svg.selectAll(".recompose-clip")
           .select(".clip-bg")
           .attr("fill", (d: any) => d.index === currentIndex ? "#A6C7A4" : "#4F7F72")
           .attr("stroke", (d: any) => d.index === currentIndex ? "#7DA87B" : "none");

        const obj = layoutClips[currentIndex];
        if (obj) {
            const ctClamped = Math.max(obj.start, Math.min(obj.end ?? (obj.start + obj.duration), currentTime));
            const progress = obj.duration ? (ctClamped - obj.start) / obj.duration : 0;
            let px = obj.x + progress * obj.width;
            px = Math.max(0, Math.min(totalWidth, px));
            svg.select(".playhead").attr("transform", `translate(${px}, 0)`);
        }
    }, [currentIndex, currentTime, layoutClips, totalWidth]);

    return (
        <div style={{ width: "100%", height: "100%", overflowX: "auto", overflowY: "hidden" }}>
            <svg ref={svgRef} style={{ display: "block" }} />
        </div>
    );
}
