import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import type { Clip } from "../types";

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

type Props = {
    duration: number;
    currentTime: number;
    start: number | null;
    end: number | null;
    savedClips?: Clip[];
    selectedClipId: string | null;
    onSelectClip?: (id: string | null) => void;
    onSeek?: (t: number) => void;
    onDeleteClip?: (id: string) => void;
    height?: number;
};

export default function VideoTimelineD3({
    duration,
    currentTime,
    start,
    end,
    savedClips = [],
    selectedClipId,
    onSelectClip,
    onSeek,
    onDeleteClip,
    height = 64,
}: Props) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const fmt = useMemo(() => d3.timeFormat("%M:%S"), []);
    const fmtTime = (t: number) => fmt(new Date(t * 1000));

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl) return;

        // Dimensions and scales
        const width = svgEl.clientWidth || 600;
        const margin = { top: 14, right: 12, bottom: 18, left: 12 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // Time scale
        const dur = Math.max(0.001, duration || 0.001);
        const ct = clamp(currentTime || 0, 0, dur);

        const x = d3.scaleLinear().domain([0, dur]).range([0, innerW]);
        const xInv = (px: number) => clamp(x.invert(px), 0, dur);

        // Setup SVG
        const svg = d3.select(svgEl);
        svg.selectAll("*").remove();

        const g = svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", `${height}px`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const gNode = g.node() as SVGGElement;

        const pointerX = (evt: any) => {
            const [px] = d3.pointer(evt, gNode);
            return clamp(px, 0, innerW);
        };
        const pointerTime = (evt: any) => xInv(pointerX(evt));

        // Timeline background
        g.append("rect")
            .attr("x", 0)
            .attr("y", innerH / 2 - 6)
            .attr("width", innerW)
            .attr("height", 12)
            .attr("rx", 6)
            .attr("fill", "#A6C7A4");

        // Draft clip area
        if (start != null) {
            const s = clamp(start, 0, dur);
            const e = clamp(end == null ? dur : end, 0, dur);
            const [a, b] = s <= e ? [s, e] : [e, s];

            g.append("rect")
                .attr("x", x(a))
                .attr("y", innerH / 2 - 10)
                .attr("width", Math.max(1, x(b) - x(a)))
                .attr("height", 20)
                .attr("rx", 6)
                .attr("fill", "#7DA87B")
                .attr("opacity", 0.35);
        }
        // Clickable area for seeking
        g.append("rect")
            .attr("x", 0)
            .attr("y", innerH / 2 - 18)
            .attr("width", innerW)
            .attr("height", 36)
            .attr("fill", "transparent")
            .style("cursor", "pointer")
            .on("click", (event) => {
                onSelectClip?.(null);
                if (!onSeek) return;
                const t = pointerTime(event);
                onSeek(t);
            });

        // Clip groups
        const clipG = g.append("g");

        const norm = (c: Clip) => {
            const s = clamp(c.start ?? 0, 0, dur);
            const eRaw = c.end == null ? dur : c.end;
            const e = clamp(eRaw, 0, dur);
            return s <= e ? { s, e } : { s: e, e: s };
        };

        const groups = clipG
            .selectAll("g.clip")
            .data(savedClips, (d: any) => d.id)
            .enter()
            .append("g")
            .attr("class", "clip");

        // Clip body
        groups
            .append("rect")
            .attr("class", "clip-body")
            .attr("x", (d) => x(norm(d).s))
            .attr("y", innerH / 2 - 10)
            .attr("width", (d) => Math.max(2, x(norm(d).e) - x(norm(d).s)))
            .attr("height", 20)
            .attr("rx", 6)
            .attr("fill", (d) => (d.id === selectedClipId ? "#A6C7A4" : "#4F7F72"))
            .attr("opacity", 0.75)
            .style("cursor", "pointer")
            .on("pointerdown", (event) => event.stopPropagation())
            .on("click", (event, d) => {
                event.stopPropagation();
                onSelectClip?.(d.id);
            });


        const selected = groups.filter((d) => d.id === selectedClipId);
        // Delete button (circle with "×")
        selected
            .append("circle")
            .attr("cx", (d) => x(norm(d).e) + 12)
            .attr("cy", innerH / 2)
            .attr("r", 10)
            .attr("fill", "#ff4444")
            .attr("opacity", 0)
            .style("cursor", "pointer")
            .style("transition", "opacity 0.2s")
            .on("pointerdown", (event) => event.stopPropagation())
            .on("click", (event, d) => {
                event.stopPropagation();
                onDeleteClip?.(d.id);
            });
        // "×" icon for delete button
        selected
            .append("text")
            .attr("x", (d) => x(norm(d).e) + 12)
            .attr("y", innerH / 2 + 4)
            .attr("text-anchor", "middle")
            .attr("font-size", 14)
            .attr("fill", "#fff")
            .style("cursor", "pointer")
            .style("transition", "opacity 0.2s")
            .style("opacity", 0)
            .text("×")
            .on("pointerdown", (event) => event.stopPropagation())
            .on("click", (event, d) => {
                event.stopPropagation();
                onDeleteClip?.(d.id);
            });

        // Show delete button
        groups.on("mouseenter", function () {
            d3.select(this).selectAll("circle, text").style("opacity", 1);
        }).on("mouseleave", function () {
            d3.select(this).selectAll("circle, text").style("opacity", 0);
        });
        // Clip start/end markers
        if (start != null) {
            g.append("line")
                .attr("x1", x(clamp(start, 0, dur)))
                .attr("x2", x(clamp(start, 0, dur)))
                .attr("y1", innerH / 2 - 14)
                .attr("y2", innerH / 2 + 14)
                .attr("stroke", "#424242")
                .attr("stroke-width", 2);
        }
        if (end != null) {
            g.append("line")
                .attr("x1", x(clamp(end, 0, dur)))
                .attr("x2", x(clamp(end, 0, dur)))
                .attr("y1", innerH / 2 - 14)
                .attr("y2", innerH / 2 + 14)
                .attr("stroke", "#424242")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 3");
        }
        // Playhead
        g.append("line")
            .attr("class", "playhead-line")
            .attr("x1", x(ct))
            .attr("x2", x(ct))
            .attr("y1", innerH / 2 - 18)
            .attr("y2", innerH / 2 + 18)
            .attr("stroke", "#111")
            .attr("stroke-width", 2);

        g.append("circle")
            .attr("class", "playhead-dot")
            .attr("cx", x(ct))
            .attr("cy", innerH / 2)
            .attr("r", 5)
            .attr("fill", "#111");

        // Time labels
        g.append("text")
            .attr("class", "playhead-label")
            .attr("x", 0)
            .attr("y", innerH + 14)
            .attr("font-size", 11)
            .attr("fill", "#D6E2DB")
            .text("0:00");

        g.append("text")
            .attr("x", innerW)
            .attr("y", innerH + 14)
            .attr("text-anchor", "end")
            .attr("font-size", 11)
            .attr("fill", "#D6E2DB")
            .text(fmtTime(dur));

        g.append("text")
            .attr("x", x(ct))
            .attr("y", -2)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "#D6E2DB")
            .text(fmtTime(ct));
    }, [duration, start, end, savedClips, selectedClipId, onSeek, onDeleteClip, onSelectClip, height]);

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl) return;

        const width = svgEl.clientWidth || 600;
        const margin = { left: 12, right: 12 };
        const innerW = width - margin.left - margin.right;

        const dur = Math.max(0.001, duration || 0.001);
        const ct = clamp(currentTime || 0, 0, dur);

        const x = d3.scaleLinear().domain([0, dur]).range([0, innerW]);

        const svg = d3.select(svgEl);
        const g = svg.select("g");

        // Move playhead only
        g.select<SVGLineElement>("line.playhead-line")
            .attr("x1", x(ct))
            .attr("x2", x(ct));

        g.select<SVGCircleElement>("circle.playhead-dot")
            .attr("cx", x(ct));

        g.select<SVGTextElement>("text.playhead-label")
            .attr("x", x(ct))
            .text(fmtTime(ct));
    }, [currentTime, duration]);

    return <svg ref={svgRef} />;
}