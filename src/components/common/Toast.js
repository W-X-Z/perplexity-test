export const Toast = ({ message, type, show }) => {
  if (!show) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
        <span className="text-xl">
          {type === 'error' ? '❌' : '✅'}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}; 