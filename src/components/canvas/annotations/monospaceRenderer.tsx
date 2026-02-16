// Renders monospace text with letter-spacing to fill width

export function renderMonospaceLines(content: string, boxWidth: number, fontSize: number): React.ReactNode {
  const lines = content.split('\n');
  const paddingOffset = 4; // Account for 2px padding on each side
  const usableWidth = boxWidth - paddingOffset;

  return lines.map((line, idx) => {
    if (line.length === 0) {
      return <div key={idx} style={{ height: `${fontSize * 1.2}px` }}>&nbsp;</div>;
    }

    // Estimate character width in monospace font (Courier New): ~0.6 × fontSize
    const charWidth = fontSize * 0.6;
    const totalCharsWidth = line.length * charWidth;

    // Calculate letter-spacing to distribute characters across full width
    // Formula: extra space needed / (number of gaps between characters)
    const letterSpacing = line.length > 1
      ? (usableWidth - totalCharsWidth) / (line.length - 1)
      : 0;

    return (
      <div
        key={idx}
        style={{
          letterSpacing: `${Math.max(0, letterSpacing)}px`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {line}
      </div>
    );
  });
}
