import { BrowserRouter } from 'react-router-dom';
import './App.css';
import PublicRoute from './pages/Public/PublicRoute'; // Assuming this is the correct path
// import AdminRoute from './pages/Admin/AdminRoute'; // Example for a full application


function App() {
  return (
    <BrowserRouter>
      {/* In a real app, you might have conditional rendering here,
        e.g., based on authentication status:
        {isLoggedIn ? <AdminRoute /> : <PublicRoute />}
      */}
      <PublicRoute/>
    </BrowserRouter>
  );
}

export default App;