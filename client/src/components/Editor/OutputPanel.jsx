const OutputPanel = ({ output, isRunning, onClose }) => {
  const hasError = output?.stderr && output.stderr.trim().length > 0;
  const hasOutput = output?.stdout && output.stdout.trim().length > 0;
  const exitFailed = output?.code !== 0 && output?.code !== null;

  return (
    <div className="h-48 bg-gray-950 border-t border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">OUTPUT</span>
          {output && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              exitFailed || hasError
                ? "bg-red-500/10 text-red-400"
                : "bg-green-500/10 text-green-400"
            }`}>
              {exitFailed || hasError ? "Error" : "Success"}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-400 text-xs transition"
        >
          Clear ×
        </button>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs">
        {isRunning ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Running...
          </div>
        ) : !output ? (
          <span className="text-gray-600">Run your code to see output here</span>
        ) : (
          <>
            {hasOutput && (
              <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                {output.stdout}
              </pre>
            )}
            {hasError && (
              <pre className="text-red-400 whitespace-pre-wrap leading-relaxed mt-1">
                {output.stderr}
              </pre>
            )}
            {!hasOutput && !hasError && (
              <span className="text-gray-500">No output</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;