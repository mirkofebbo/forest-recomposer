import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { Clip } from "../types";

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function fmtHMS(seconds: number) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
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
    height = 70,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [width, setWidth] = useState(0);

    // Measure width reliably
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const w = Math.floor(el.getBoundingClientRect().width);
            if (w > 0) setWidth(w);
        });

        ro.observe(el);

        // initial measure
        const w0 = Math.floor(el.getBoundingClientRect().width);
        if (w0 > 0) setWidth(w0);

        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl) return;
        if (width <= 0) return;

        const margin = { top: 16, right: 12, bottom: 18, left: 12 };
        const innerW = Math.max(1, width - margin.left - margin.right);
        const innerH = Math.max(1, height - margin.top - margin.bottom);

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

        // Saved clips ranges
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

        // Draft clip highlight
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
            const s = x(clamp(start, 0, dur));
            g.append("line")
                .attr("x1", s)
                .attr("x2", s)
                .attr("y1", innerH / 2 - 14)
                .attr("y2", innerH / 2 + 14)
                .attr("stroke", "#424242")
                .attr("stroke-width", 2);
        }

        // End marker
        if (end != null) {
            const e = x(clamp(end, 0, dur));
            g.append("line")
                .attr("x1", e)
                .attr("x2", e)
                .attr("y1", innerH / 2 - 14)
                .attr("y2", innerH / 2 + 14)
                .attr("stroke", "#424242")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 3");
        }

        // Playhead
        const px = x(ct);
        g.append("line")
            .attr("x1", px)
            .attr("x2", px)
            .attr("y1", innerH / 2 - 18)
            .attr("y2", innerH / 2 + 18)
            .attr("stroke", "#111")
            .attr("stroke-width", 2);

        g.append("circle")
            .attr("cx", px)
            .attr("cy", innerH / 2)
            .attr("r", 5)
            .attr("fill", "#111");

        // Labels (these are your “timecodes”)
        g.append("text")
            .attr("x", 0)
            .attr("y", innerH + 14)
            .attr("font-size", 11)
            .attr("fill", "#111")
            .text("0:00");

        g.append("text")
            .attr("x", innerW)
            .attr("y", innerH + 14)
            .attr("text-anchor", "end")
            .attr("font-size", 11)
            .attr("fill", "#111")
            .text(fmtHMS(dur));

        g.append("text")
            .attr("x", px)
            .attr("y", -2)
            .attr("text-anchor", "middle")
            .attr("font-size", 11)
            .attr("fill", "#111")
            .text(fmtHMS(ct));

        // Click-to-seek overlay
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
                onSeek(clamp(x.invert(mx), 0, dur));
            });
    }, [width, duration, currentTime, start, end, savedClips, onSeek, height]);

    return (
        <div ref={wrapperRef} style={{ width: "100%" }}>
            <svg ref={svgRef} />
        </div>
    );
}