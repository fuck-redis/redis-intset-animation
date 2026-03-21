import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnimationStep, ENCODING_CONFIG, IntSetState } from '../../types/intset';
import './VisualizationArea.css';

interface VisualizationAreaProps {
  intSetState: IntSetState;
  currentStepData: AnimationStep | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ intSetState, currentStepData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;

    const zoomLayer = svg.append('g').attr('class', 'zoom-layer');
    const root = zoomLayer.append('g').attr('class', 'viz-root');

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'flow-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M0,0 L10,5 L0,10 z')
      .attr('fill', '#0284c7');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 3.2])
      .on('zoom', (event) => {
        zoomLayer.attr('transform', event.transform.toString());
      });

    svg.call(zoom as never);
    svg.call(zoom.transform as never, d3.zoomIdentity.translate(20, 10).scale(1));

    const margin = { top: 72, right: 24, bottom: 70, left: 24 };
    const innerWidth = width - margin.left - margin.right;
    const baseY = 170;

    const g = root.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const encodingConfig = ENCODING_CONFIG[intSetState.encoding];

    g.append('text')
      .attr('class', 'viz-title')
      .attr('x', innerWidth / 2)
      .attr('y', -34)
      .attr('text-anchor', 'middle')
      .text(`IntSet 内存布局 · ${encodingConfig.label}`);

    g.append('text')
      .attr('class', 'viz-subtitle')
      .attr('x', innerWidth / 2)
      .attr('y', -13)
      .attr('text-anchor', 'middle')
      .text(
        `值域 ${encodingConfig.min.toLocaleString()} ~ ${encodingConfig.max.toLocaleString()} | ${encodingConfig.bytes}B/元素`,
      );

    const headerBox = g.append('g').attr('class', 'header-box').attr('transform', 'translate(0, 14)');

    const boxWidth = 134;
    const boxHeight = 44;
    const boxGap = 12;
    const totalHeaderWidth = boxWidth * 3 + boxGap * 2;
    const startHeaderX = (innerWidth - totalHeaderWidth) / 2;

    const headerItems = [
      { label: 'encoding', value: encodingConfig.label },
      { label: 'length', value: String(intSetState.length) },
      { label: 'blob', value: `${intSetState.byteSize}B` },
    ];

    headerItems.forEach((item, index) => {
      const x = startHeaderX + index * (boxWidth + boxGap);
      const card = headerBox.append('g').attr('transform', `translate(${x},0)`);
      card.append('rect').attr('class', 'header-cell').attr('width', boxWidth).attr('height', boxHeight).attr('rx', 8);
      card.append('text').attr('class', 'header-cell-label').attr('x', 10).attr('y', 16).text(item.label);
      card.append('text').attr('class', 'header-cell-value').attr('x', 10).attr('y', 33).text(item.value);
    });

    if (currentStepData?.data?.comparison) {
      g.append('text')
        .attr('class', 'viz-comparison')
        .attr('x', innerWidth / 2)
        .attr('y', 8)
        .attr('text-anchor', 'middle')
        .text(`比较: ${currentStepData.data.comparison}`);
    }

    if (intSetState.length === 0) {
      g.append('text')
        .attr('class', 'empty-message')
        .attr('x', innerWidth / 2)
        .attr('y', 120)
        .attr('text-anchor', 'middle')
        .text('IntSet 为空，先插入几个整数试试');
      return;
    }

    const gap = 16;
    const blockWidth = Math.max(
      72,
      Math.min(110, (innerWidth - gap * (intSetState.length - 1)) / intSetState.length),
    );
    const totalWidth = blockWidth * intSetState.length + gap * (intSetState.length - 1);
    const startX = (innerWidth - totalWidth) / 2;

    const getX = (index: number) => startX + index * (blockWidth + gap);

    const blockGroups = g
      .selectAll<SVGGElement, IntSetState['memoryLayout'][number]>('.memory-block')
      .data(intSetState.memoryLayout)
      .enter()
      .append('g')
      .attr('class', (block) => {
        const classes = ['memory-block'];
        if (block.isSearching) classes.push('searching');
        if (block.isMoving) classes.push('moving');
        if (block.isDeleting) classes.push('deleting');
        if (block.isUpgrading) classes.push('upgrading');
        if (block.isNew) classes.push('new');
        return classes.join(' ');
      })
      .attr('transform', (block) => `translate(${getX(block.index)}, ${baseY})`);

    blockGroups
      .append('rect')
      .attr('width', blockWidth)
      .attr('height', 84)
      .attr('rx', 10)
      .attr('class', 'block-rect');

    blockGroups
      .append('text')
      .attr('class', 'block-index')
      .attr('x', blockWidth / 2)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .text((block) => `[${block.index}]`);

    blockGroups
      .append('text')
      .attr('class', 'block-value')
      .attr('x', blockWidth / 2)
      .attr('y', 33)
      .attr('text-anchor', 'middle')
      .text((block) => block.value);

    blockGroups
      .append('text')
      .attr('class', 'block-hex')
      .attr('x', blockWidth / 2)
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .text((block) => block.hexValue);

    blockGroups
      .append('text')
      .attr('class', 'block-bytes')
      .attr('x', blockWidth / 2)
      .attr('y', 76)
      .attr('text-anchor', 'middle')
      .text((block) => `${block.bytes}B`);

    if (currentStepData?.data?.pointers) {
      const pointerColors: Record<'left' | 'right' | 'mid', string> = {
        left: '#0284c7',
        right: '#dc2626',
        mid: '#16a34a',
      };

      (['left', 'right', 'mid'] as const).forEach((key) => {
        const index = currentStepData.data?.pointers?.[key];
        if (index === undefined || index < 0 || index >= intSetState.length) return;

        const x = getX(index) + blockWidth / 2;
        const y1 = baseY - 42;
        const y2 = baseY - 4;

        g.append('line')
          .attr('x1', x)
          .attr('y1', y1)
          .attr('x2', x)
          .attr('y2', y2)
          .attr('stroke', pointerColors[key])
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#flow-arrow)');

        g.append('text')
          .attr('class', 'pointer-label')
          .attr('x', x)
          .attr('y', y1 - 7)
          .attr('text-anchor', 'middle')
          .attr('fill', pointerColors[key])
          .text(key.toUpperCase());
      });
    }

    if (currentStepData?.data?.pointers) {
      const left = currentStepData.data.pointers.left;
      const right = currentStepData.data.pointers.right;
      if (left >= 0 && right >= 0 && left < intSetState.length && right < intSetState.length && left <= right) {
        const x1 = getX(left);
        const x2 = getX(right) + blockWidth;
        const y = baseY - 56;

        g.append('line')
          .attr('x1', x1)
          .attr('y1', y)
          .attr('x2', x2)
          .attr('y2', y)
          .attr('stroke', '#0369a1')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6 4');

        g.append('text')
          .attr('class', 'range-label')
          .attr('x', (x1 + x2) / 2)
          .attr('y', y - 6)
          .attr('text-anchor', 'middle')
          .text('当前搜索区间');
      }
    }

    if (
      currentStepData?.data?.fromIndex !== undefined &&
      currentStepData?.data?.toIndex !== undefined &&
      currentStepData.data.fromIndex >= 0 &&
      currentStepData.data.toIndex >= 0 &&
      currentStepData.data.fromIndex < intSetState.length + 1 &&
      currentStepData.data.toIndex < intSetState.length + 1
    ) {
      const fromX = getX(Math.min(currentStepData.data.fromIndex, intSetState.length - 1)) + blockWidth / 2;
      const toX = getX(Math.min(currentStepData.data.toIndex, intSetState.length - 1)) + blockWidth / 2;
      const y = baseY + 104;

      g.append('path')
        .attr(
          'd',
          `M${fromX},${y} C${fromX},${y + 24} ${toX},${y + 24} ${toX},${y}`,
        )
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#flow-arrow)');

      g.append('text')
        .attr('class', 'flow-label')
        .attr('x', (fromX + toX) / 2)
        .attr('y', y + 32)
        .attr('text-anchor', 'middle')
        .text(currentStepData.phase === 'shift-left' ? '左移' : '右移');
    }

    g.append('text')
      .attr('class', 'total-bytes')
      .attr('x', innerWidth / 2)
      .attr('y', baseY + 160)
      .attr('text-anchor', 'middle')
      .text(
        `头部: ${intSetState.headerByteSize}B | 数据: ${intSetState.payloadByteSize}B | 总计: ${intSetState.byteSize}B`,
      );

    if (currentStepData?.data?.message) {
      g.append('text')
        .attr('class', 'step-message')
        .attr('x', innerWidth / 2)
        .attr('y', baseY + 190)
        .attr('text-anchor', 'middle')
        .text(currentStepData.data.message);
    }
  }, [currentStepData, intSetState]);

  return (
    <div className="visualization-area">
      <svg ref={svgRef} className="visualization-svg" />
    </div>
  );
};

export default VisualizationArea;
