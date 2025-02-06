export const InputField = ({ 
  icon, 
  label, 
  type = 'text',
  className = '',
  options,
  isPrompt,
  ...props 
}) => {
  const baseInputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  
  if (type === 'range') {
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-gray-700 font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </div>
          <span className="text-sm text-gray-500">{props.value}</span>
        </label>
        <input
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          {...props}
        />
      </div>
    );
  }

  if (options) {
    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-gray-700 font-medium">
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </label>
        <select
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (isPrompt) {
    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-gray-700 font-medium">
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </label>
        <textarea
          className={`${baseInputClass} min-h-[200px] font-mono text-base resize-vertical`}
          {...props}
        />
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-gray-700">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{label}</span>
        </label>
        <textarea
          className={`${baseInputClass} min-h-[100px] resize-none`}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-gray-700 font-medium">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </label>
      <input
        type={type}
        className={`${baseInputClass} ${className}`}
        {...props}
      />
    </div>
  );
}; 