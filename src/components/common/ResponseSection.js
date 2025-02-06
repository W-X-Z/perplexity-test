export const ResponseSection = ({ response, citations }) => {
  return (
    <div className="col-span-full bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200">
      <h2 className="flex items-center space-x-2 text-gray-700 font-medium mb-4">
        <span className="text-xl">🤖</span>
        <span>AI 응답</span>
      </h2>
      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {response}
        </div>
      </div>
      {citations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">참고 문헌</h3>
          <ul className="space-y-2">
            {citations.map((citation, index) => (
              <li key={index} className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                {citation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 