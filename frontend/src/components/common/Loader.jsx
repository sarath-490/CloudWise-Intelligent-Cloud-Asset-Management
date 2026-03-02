const Loader = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-16 w-16',
  };

  const sizeClass = sizes[size] || sizes.medium;

  return (
    <div className={`flex items-center justify-center w-full py-10 ${className}`.trim()}>
      <div className={`${sizeClass} border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loader;
