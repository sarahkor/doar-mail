import './App.css';
import Navbar from './components/Navbar';
import LabelSidebar from './components/LabelSidebar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="app-content" style={{ display: 'flex' }}>
        <LabelSidebar />
        <div style={{ flexGrow: 1, padding: '20px' }}>
          {/* כאן תוצג רשימת המיילים או עמודים נוספים בהמשך */}
          <h1>Inbox</h1>
          <p>Select a label to filter mails</p>
        </div>
      </div>
    </div>
  );
}

export default App;
