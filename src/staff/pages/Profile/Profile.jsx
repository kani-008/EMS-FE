import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Building, Award, Activity } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-full bg-slate-50/50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight">My Profile</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={48} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
                <p className="text-slate-500 font-medium mt-1">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Cards */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="form-label">Role Identity</p>
                  <p className="form-value">{user.role} {user.roleId && `(${user.roleId})`}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Building size={24} />
                </div>
                <div>
                  <p className="form-label">Department</p>
                  <p className="form-value">
                    {user.departmentName || "N/A"} 
                    {user.department_id && <span className="text-slate-400 text-sm ml-1">(ID: {user.department_id})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="form-label">Account Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <p className="form-value">{user.status || "Active"}</p>
                  </div>
                </div>
              </div>

              {user.role === 'ADVISOR' && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="form-label">Advisor Assignment</p>
                    <p className="form-value">
                      Batch: {user.batch || "N/A"} 
                      {user.current_year && <span className="text-slate-400 text-sm ml-1">(Year: {user.current_year})</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
