import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-[120px] font-bold text-indigo-600 leading-none mb-6">404</h1>
        <h2 className="text-3xl font-semibold text-slate-900 mb-4">Page Not Found</h2>
        <p className="text-base text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="large">
                <Home size={18} />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="primary" size="large">
                <Home size={18} />
                Go to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
