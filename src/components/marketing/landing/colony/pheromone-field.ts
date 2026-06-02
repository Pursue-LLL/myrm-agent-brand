/**
 * [INPUT]
 * - 无外部模块依赖
 *
 * [OUTPUT]
 * - PheromoneField: 信息素栅格场
 *
 * [POS]
 * 蚂蚁 stigmergy 模拟的信息素 deposit/decay/gradient 纯逻辑。
 */

export class PheromoneField {
  private readonly cells: Float32Array;

  constructor(
    readonly cols: number,
    readonly rows: number,
  ) {
    this.cells = new Float32Array(cols * rows);
  }

  clear(): void {
    this.cells.fill(0);
  }

  decay(factor: number): void {
    for (let i = 0; i < this.cells.length; i += 1) {
      this.cells[i] *= factor;
      if (this.cells[i] < 0.002) this.cells[i] = 0;
    }
  }

  deposit(canvasX: number, canvasY: number, canvasW: number, canvasH: number, amount: number): void {
    if (canvasW <= 0 || canvasH <= 0) return;
    const col = Math.floor((canvasX / canvasW) * this.cols);
    const row = Math.floor((canvasY / canvasH) * this.rows);
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return;
    const idx = row * this.cols + col;
    this.cells[idx] = Math.min(1, this.cells[idx] + amount);
  }

  gradientAt(canvasX: number, canvasY: number, canvasW: number, canvasH: number): { gx: number; gy: number } {
    if (canvasW <= 0 || canvasH <= 0) return { gx: 0, gy: 0 };
    const col = Math.floor((canvasX / canvasW) * this.cols);
    const row = Math.floor((canvasY / canvasH) * this.rows);
    const left = this.sample(col - 1, row);
    const right = this.sample(col + 1, row);
    const up = this.sample(col, row - 1);
    const down = this.sample(col, row + 1);
    return { gx: right - left, gy: down - up };
  }

  drawHeatmap(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    alphaScale: number,
  ): void {
    const cellW = canvasW / this.cols;
    const cellH = canvasH / this.rows;
    const radius = Math.min(cellW, cellH) * 0.42;
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const value = this.cells[row * this.cols + col];
        if (value < 0.04) continue;
        const cx = col * cellW + cellW / 2;
        const cy = row * cellH + cellH / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(88, 142, 149, ${value * alphaScale})`;
        ctx.fill();
      }
    }
  }

  private sample(col: number, row: number): number {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return 0;
    return this.cells[row * this.cols + col];
  }
}
