// Screen ↔ page coordinate transform using SVG's getScreenCTM

export function screenToPage(
  clientX: number,
  clientY: number,
  svgElement: SVGSVGElement
): { x: number; y: number } {
  const ctm = svgElement.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inverse = ctm.inverse();
  return {
    x: inverse.a * clientX + inverse.c * clientY + inverse.e,
    y: inverse.b * clientX + inverse.d * clientY + inverse.f,
  };
}
