import { useEffect, useRef } from "react";
import * as d3 from "d3";

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
    onSelectClip: (index: number) => void;
    onReorderClips: (dragIndex: number, dropIndex: number) => void;
    height?: number;
};

export default function RecomposeTimelineD3({
    clips,
    currentIndex,
    onSelectClip,
    onReorderClips,
    height = 80,
}: Props) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl || clips.length === 0) return;

        const width = svgEl.clientWidth || 800; // Will scale automatically mostly
        const margin = { top: 12, right: 12, bottom: 12, left: 12 };
        const innerH = height - margin.top - margin.bottom;

        // Give each clip a proportional width (e.g., 5px per sec) mapped to domain
        const minBlockWidth = 50;
        const maxBlockWidth = 250;
        const spacing = 4;

        let totalLength = 0;
        const layoutClips: any[] = [];

        clips.forEach((clip, i) => {
            const w = Math.max(minBlockWidth, Math.min(maxBlockWidth, clip.duration * 5));
            layoutClips.push({ ...clip, index: i, x: totalLength, width: w });
            totalLength += w + spacing;
        });

        const totalWidth = margin.left + margin.right + totalLength;
        
        const svg = d3.select(svgEl);
        svg.selectAll("*").remove();

        svg
            .attr("viewBox", `0 0 ${totalWidth} ${height}`)
            .style("width", `${totalWidth}px`)
            .style("height", `${height}px`);

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

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
            .attr("height", innerH)
            .attr("rx", 6)
            .attr("fill", d => d.index === currentIndex ? "#A6C7A4" : "#4F7F72")
            .attr("stroke", d => d.index === currentIndex ? "#7DA87B" : "none")
            .attr("stroke-width", 2)
            .style("cursor", "grab");

        // Title text
        groups.append("text")
            .text(d => d.title || "Clip")
            .attr("x", 8)
            .attr("y", innerH / 2 + 4)
            .attr("font-size", 12)
            .attr("font-weight", 600)
            .attr("fill", "#fff")
            .style("pointer-events", "none")
            .each(function(d: any) {
                // simple truncate
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
            if (evt.defaultPrevented) return; // Ignore click if dragging
            onSelectClip(d.index);
        });

        // Add D3 Drag Behavior
        let draggedNode: any = null;
        let dragStartX = 0;

        const drag = d3.drag<any, any>()
            .on("start", function(event, d) {
                d3.select(this).raise(); // Bring to front
                d3.select(this).select(".clip-bg")
                    .style("cursor", "grabbing")
                    .attr("opacity", 0.8);
                draggedNode = this;
                dragStartX = d.x;
            })
            .on("drag", function(event, d) {
                // Move visually
                dragStartX += event.dx;
                d3.select(this).attr("transform", `translate(${dragStartX}, 0)`);
                event.sourceEvent.preventDefault();
            })
            .on("end", function(event, d) {
                event.sourceEvent.stopPropagation();
                
                d3.select(this).select(".clip-bg")
                    .style("cursor", "grab")
                    .attr("opacity", 1);
                
                // Find where we dropped it based on X coordinate
                // dragStartX represents the center-ish of the clip depending on grab, but mostly left bound.
                const centerDropX = dragStartX + (d.width / 2);
                
                let targetIndex = layoutClips.length - 1;
                for (let i = 0; i < layoutClips.length; i++) {
                    const lc = layoutClips[i];
                    if (centerDropX < lc.x + lc.width / 2) {
                        targetIndex = i;
                        break;
                    }
                }
                
                // If it moved
                if (targetIndex !== d.index) {
                    // Update state to notify React
                    onReorderClips(d.index, targetIndex);
                } else {
                    // Snap back
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("transform", `translate(${d.x}, 0)`);
                }
                draggedNode = null;
            });

        groups.call(drag);

        // Optional: Hover Tooltip using D3
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
            if (draggedNode) return; // Don't show tooltip while dragging
            
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
            // Cleanup tooltips on unmount
            tt.style("visibility", "hidden");
        };

    }, [clips, currentIndex, onSelectClip, onReorderClips, height]);

    return (
        <div style={{ width: "100%", height: "100%", overflowX: "auto", overflowY: "hidden" }}>
            <svg ref={svgRef} style={{ display: "block" }} />
        </div>
    );
}
