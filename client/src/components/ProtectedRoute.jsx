import {Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { user , loading } = useAuth();
    if(loading){
        return(
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400/80">
              Loading…
            </div>
        )
    }
    if(!user){ return(
        <Navigate to="/login" replace />
    )};
    return children;
};
export default ProtectedRoute;

