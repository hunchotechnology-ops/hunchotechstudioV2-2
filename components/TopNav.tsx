'use client';

export default function TopNav({ items, activeItem }: { items: string[]; activeItem: string }) {
  return (
    <nav className="border-b border-border bg-surface/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-sm whitespace-nowrap">
          <span className="text-accent">✨</span>
          <span>Huncho Tech Studio-V1</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                item === activeItem
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-white hover:bg-surface-light'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
