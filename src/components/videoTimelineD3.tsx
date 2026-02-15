import React, { useEffect, useMemo, useRef } from "react";
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
    onSeek?: (t: number) => void;
    height?: number;
};

export default function VideoTimelineD3({
    duration,
    currentTime,
    start,
    end,
    savedClips = [],
    onSeek,
    height = 64,
}: Props) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const fmt = useMemo(() => d3.timeFormat("%M:%S"), []);
    const fmtTime = (t: number) => {
        return fmt(new Date(t * 1000));
    };

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl) return;

        const width = svgEl.clientWidth || 600;
        const margin = { top: 14, right: 12, bottom: 18, left: 12 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        const dur = Math.max(0.001, duration || 0.001);
        const ct = clamp(currentTime || 0, 0, dur);

        const x = d3.scaleLinear().domain([0, dur]).range([0, innerW]);

        const svg = d3.select(svgEl);
        svg.selectAll("*").remove();

        const g = svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", `${height}px`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Background track
        g.append("rect")
            .attr("x", 0)
            .attr("y", innerH / 2 - 6)
            .attr("width", innerW)
            .attr("height", 12)
            .attr("rx", 6)
            .attr("fill", "#e6e6e6");

        // Saved clips (ranges)
        if (savedClips.length) {
            g.append("g")
                .selectAll("rect")
                .data(savedClips)
                .enter()
                .append("rect")
                .attr("x", (d) => x(clamp(d.start, 0, dur)))
                .attr("y", innerH / 2 - 9)
                .attr("width", (d) => {
                    const e = d.end == null ? dur : d.end;
                    return Math.max(1, x(clamp(e, 0, dur)) - x(clamp(d.start, 0, dur)));
                })
                .attr("height", 18)
                .attr("rx", 6)
                .attr("fill", "#bdbdbd")
                .attr("opacity", 0.35);
        }

        // Current clip (start..end) highlight
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
                .attr("fill", "#9e9e9e")
                .attr("opacity", 0.55);
        }

        // Start marker
        if (start != null) {
            g.append("line")
                .attr("x1", x(clamp(start, 0, dur)))
                .attr("x2", x(clamp(start, 0, dur)))
                .attr("y1", innerH / 2 - 14)
                .attr("y2", innerH / 2 + 14)
                .attr("stroke", "#424242")
                .attr("stroke-width", 2);
        }

        // End marker
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
            .attr("x1", x(ct))
            .attr("x2", x(ct))
            .attr("y1", innerH / 2 - 18)
            .attr("y2", innerH / 2 + 18)
            .attr("stroke", "#111")
            .attr("stroke-width", 2);

        g.append("circle")
            .attr("cx", x(ct))
            .attr("cy", innerH / 2)
            .attr("r", 5)
            .attr("fill", "#111");

        // Axis labels (just 0 and end, plus a current time label)
        g.append("text")
            .attr("x", 0)
            .attr("y", innerH + 14)
            .attr("font-size", 11)
            .attr("fill", "#333")
            .text("0:00");

        g.append("text")
            .attr("x", innerW)
            .attr("y", innerH + 14)
            .attr("text-anchor", "end")
            .attr("font-size", 11)
            .attr("fill", "#333")
            .text(fmtTime(dur));

        g.append("text")
            .attr("x", x(ct))
            .attr("y", -2)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "#111")
            .text(fmtTime(ct));

        // Click-to-seek interaction (transparent overlay)
        g.append("rect")
            .attr("x", 0)
            .attr("y", innerH / 2 - 18)
            .attr("width", innerW)
            .attr("height", 36)
            .attr("fill", "transparent")
            .style("cursor", "pointer")
            .on("click", (event) => {
                if (!onSeek) return;
                const [mx] = d3.pointer(event);
                const t = x.invert(mx);
                onSeek(clamp(t, 0, dur));
            });
    }, [duration, currentTime, start, end, savedClips, onSeek, height]);

    return <svg ref={svgRef} />;
}