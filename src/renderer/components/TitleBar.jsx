export default function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-title">💰 Expense Tracker</div>
      <div className="title-bar-controls">
        <button className="title-bar-btn" onClick={handleMinimize} title="Minimize">
          −
        </button>
        <button className="title-bar-btn" onClick={handleMaximize} title="Maximize">
          ☐
        </button>
        <button className="title-bar-btn close" onClick={handleClose} title="Close">
          ✕
        </button>
      </div>
    </div>
  );
}