export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3">
      <div
        className={`${sizes[size] || sizes.md} border-cinema-border border-t-cinema-accent rounded-full animate-spin`}
      />
      {text && <p className="text-cinema-muted text-sm">{text}</p>}
    </div>
  );
}

