import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { Lock, Home } from 'lucide-react';

const Unauthorized = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <Lock size={48} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-4">Unauthorized Access</h1>
        <p className="text-base text-slate-600 mb-8">
          You don't have permission to access this resource. Please log in with appropriate credentials.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
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
                Go to Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
