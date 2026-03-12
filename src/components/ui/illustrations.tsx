export function StackedCardsIllustration() {
  return (
    <div aria-hidden="true" className="relative" style={{ width: 120, height: 100 }}>
      <div className="absolute bottom-0 left-2 w-24 h-16 rounded-lg" style={{ backgroundColor: '#FAF1D6' }} />
      <div className="absolute bottom-2 left-4 w-24 h-16 rounded-lg" style={{ backgroundColor: '#FDEAD7' }} />
      <div className="absolute bottom-4 left-6 w-24 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EC6C27' }}>
          <span className="text-white text-sm font-bold">+</span>
        </div>
      </div>
    </div>
  );
}

export function ChartBarsIllustration() {
  const heights = [24, 36, 20, 48, 32, 56, 40];
  return (
    <div aria-hidden="true" className="flex items-end gap-1.5" style={{ height: 80 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-3 rounded-t"
          style={{
            height: h,
            backgroundColor: i === 5 ? '#EC6C27' : '#FAF1D6',
          }}
        />
      ))}
    </div>
  );
}

export function CalendarGridIllustration() {
  return (
    <div aria-hidden="true" className="rounded-lg border border-gray-200 bg-white p-2" style={{ width: 100, height: 90 }}>
      <div className="h-3 rounded-sm mb-2" style={{ backgroundColor: '#EC6C27' }} />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: [5, 12, 18, 24].includes(i) ? '#EC6C27' : '#FAF1D6' }}
          />
        ))}
      </div>
    </div>
  );
}

export function PeopleSilhouettesIllustration() {
  const people = [
    { x: 8, size: 28, color: '#FDEAD7' },
    { x: 36, size: 32, color: '#EC6C27' },
    { x: 68, size: 28, color: '#FAF1D6' },
  ];
  return (
    <div aria-hidden="true" className="relative" style={{ width: 110, height: 80 }}>
      {people.map((p, i) => (
        <div key={i} className="absolute bottom-0" style={{ left: p.x }}>
          <div
            className="rounded-full mx-auto mb-1"
            style={{ width: p.size * 0.45, height: p.size * 0.45, backgroundColor: p.color }}
          />
          <div
            className="rounded-t-full mx-auto"
            style={{ width: p.size * 0.6, height: p.size * 0.7, backgroundColor: p.color }}
          />
        </div>
      ))}
    </div>
  );
}

export function MagnifyingGlassIllustration() {
  return (
    <div aria-hidden="true" className="relative" style={{ width: 80, height: 80 }}>
      <div
        className="absolute top-0 left-0 w-14 h-14 rounded-full border-4"
        style={{ borderColor: '#EC6C27' }}
      >
        <div
          className="absolute top-2 left-2 w-3 h-3 rounded-full"
          style={{ backgroundColor: '#FDEAD7' }}
        />
      </div>
      <div
        className="absolute bottom-1 right-1 w-2 rounded-full origin-top-left rotate-45"
        style={{ height: 28, backgroundColor: '#EC6C27', left: 46, top: 46 }}
      />
    </div>
  );
}
