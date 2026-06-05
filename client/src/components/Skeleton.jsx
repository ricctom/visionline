export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '40%' }} />
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 12, width: '70%' }} />
        <div style={{ height: 24, background: '#f0f0f0', borderRadius: 4, width: '50%' }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
