import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { IntSetState, ENCODING_CONFIG } from '../../types/intset';
import './VisualizationArea.css';

interface VisualizationAreaProps {
  intSetState: IntSetState;
  isAnimating: boolean;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({
  intSetState,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;

    // 设置边距
    const margin = { top: 60, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 绘制标题
    g.append('text')
      .attr('class', 'viz-title')
      .attr('x', innerWidth / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .text(`IntSet 内存布局 - ${ENCODING_CONFIG[intSetState.encoding].label}`);

    // 绘制编码信息
    const encodingConfig = ENCODING_CONFIG[intSetState.encoding];
    g.append('text')
      .attr('class', 'viz-subtitle')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .text(`每个元素: ${encodingConfig.bytes} 字节 | 范围: ${encodingConfig.min.toLocaleString()} ~ ${encodingConfig.max.toLocaleString()}`);

    if (intSetState.length === 0) {
      g.append('text')
        .attr('class', 'empty-message')
        .attr('x', innerWidth / 2)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .text('IntSet 为空，请插入元素');
      return;
    }

    // 计算内存块宽度
    const blockWidth = Math.min(100, (innerWidth - 20 * (intSetState.length - 1)) / intSetState.length);
    const totalWidth = blockWidth * intSetState.length + 20 * (intSetState.length - 1);
    const startX = (innerWidth - totalWidth) / 2;

    // 绘制内存块
    intSetState.memoryLayout.forEach((block, i) => {
      const x = startX + i * (blockWidth + 20);
      const y = 40;

      const blockG = g.append('g')
        .attr('class', 'memory-block')
        .attr('transform', `translate(${x}, ${y})`);

      // 内存块矩形
      blockG.append('rect')
        .attr('width', blockWidth)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('class', block.isNew ? 'block-rect new' : 'block-rect')
        .attr('fill', block.isNew ? '#dcfce7' : '#f1f5f9')
        .attr('stroke', block.isNew ? '#16a34a' : '#cbd5e1')
        .attr('stroke-width', 2);

      // 值
      blockG.append('text')
        .attr('x', blockWidth / 2)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('class', 'block-value')
        .text(block.value);

      // 十六进制
      blockG.append('text')
        .attr('x', blockWidth / 2)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .attr('class', 'block-hex')
        .text(block.hexValue);

      // 索引
      blockG.append('text')
        .attr('x', blockWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('class', 'block-index')
        .text(`[${i}]`);

      // 字节大小
      blockG.append('text')
        .attr('x', blockWidth / 2)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .attr('class', 'block-bytes')
        .text(`${block.bytes}B`);
    });

    // 总字节数
    g.append('text')
      .attr('class', 'total-bytes')
      .attr('x', innerWidth / 2)
      .attr('y', 220)
      .attr('text-anchor', 'middle')
      .text(`总内存: ${intSetState.byteSize} 字节 | 元素数量: ${intSetState.length}`);

  }, [intSetState]);

  return (
    <div className="visualization-area">
      <svg ref={svgRef} className="visualization-svg"></svg>
    </div>
  );
};

export default VisualizationArea;
