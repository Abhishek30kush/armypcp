import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  Calendar, 
  Download,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Lock,
  ArrowLeft,
  Shield,
  Trash2
} from 'lucide-react';

const ADMIN_PASSWORD = "aps@admin2026";

export default function AdminDashboard() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (!adminAuth) return;
    setLoading(true);

    // Try simple query first (no orderBy which needs index)
    const q = collection(db, "applications");
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const apps = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        // Sort client-side instead of needing Firestore index
        apps.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setApplications(apps);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminAuth]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuth(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterRole === 'All' || app.teachingType === filterRole;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getFileLabel = (key) => {
    if (key === 'photoSignature') return 'Photo & Signature';
    if (key.startsWith('edu_')) {
      const id = key.replace('edu_', '').replace('_file', '');
      return `Marksheet: ${id.charAt(0).toUpperCase() + id.slice(1)}`;
    }
    if (key === 'armyDependentFile') return 'Army Dependent Cert';
    if (key === 'csbFile') return 'CSB Certificate';
    if (key === 'ctetFile') return 'CTET Certificate';
    if (key === 'receiptUrl') return 'Payment Receipt';
    return key;
  };

  const confirmPayment = async (appId) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status: "Paid"
      });
      setSelectedApp(prev => ({ ...prev, status: "Paid" }));
      alert("Payment has been successfully verified and confirmed!");
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment.");
    }
  };

  const deleteApplication = async (appId) => {
    if (window.confirm("Are you sure you want to completely delete this application? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "applications", appId));
        setSelectedApp(null);
        alert("Application has been deleted successfully.");
      } catch (error) {
        console.error("Error deleting application:", error);
        alert("Failed to delete application.");
      }
    }
  };

  // ── Admin Login Screen ──
  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm text-green-700 hover:text-green-900 font-semibold mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-1" /> Back to Application Portal
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-green-800 to-emerald-700 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Shield size={40} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Admin Panel</h2>
              <p className="text-green-100 text-sm mt-1">Army Public School, Old Cantt, Prayagraj</p>
            </div>

            <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Admin Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white/50"
                    placeholder="••••••••••"
                    required
                    autoFocus
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center"
              >
                <Lock size={18} className="mr-2" />
                Login to Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <Link to="/" className="text-sm text-green-700 hover:text-green-900 font-semibold flex items-center transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Home
            </Link>
          </div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center">
            <Users className="mr-3 text-green-600" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 font-medium">Manage and review teacher applications</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-gray-700">{applications.length} Total Applications</span>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or Application ID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400" size={20} />
          <select 
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="PGT">PGT</option>
            <option value="TGT">TGT</option>
            <option value="Balvatika">Balvatika</option>
          </select>
        </div>
      </div>

      {/* Applications Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No applications found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <div 
              key={app.id} 
              onClick={() => setSelectedApp(app)}
              className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-green-100"></div>
              
              <div className="flex justify-between items-start mb-4 relative">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold text-xl">
                  {app.name?.charAt(0).toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  app.teachingType === 'PGT' ? 'bg-blue-100 text-blue-700' :
                  app.teachingType === 'TGT' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {app.teachingType}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{app.name}</h3>
              <p className="text-sm font-mono text-gray-500 mb-4">{app.applicationId}</p>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2 opacity-70" />
                  <span className="truncate">{app.emailId}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2 opacity-70" />
                  <span>{app.mobNo}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 opacity-70" />
                  <span>{formatDate(app.createdAt)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center text-green-600 font-bold text-sm">
                View Details <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-800 to-emerald-700 p-6 text-white flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   {selectedApp.photoSignature ? (
                     <img src={selectedApp.photoSignature} alt="Applicant" className="w-full h-full object-cover rounded-2xl" />
                   ) : (
                     <User size={32} />
                   )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                  <p className="text-green-100 opacity-80 text-sm font-mono">{selectedApp.applicationId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 bg-white space-y-10">
              
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Post</span>
                  <span className="font-bold text-gray-800">{selectedApp.teachingType} {selectedApp.pgtSubject || selectedApp.tgtSubject || selectedApp.balvatikaRole}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">DOB</span>
                  <span className="font-bold text-gray-800">{selectedApp.dob}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full inline-block ${
                    selectedApp.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    selectedApp.status === 'Payment Verification Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{selectedApp.status}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Applied On</span>
                  <span className="font-bold text-gray-800">{formatDate(selectedApp.createdAt)}</span>
                </div>
              </div>

              {/* Payment Details */}
              {(selectedApp.paymentMethod || selectedApp.utrNumber) && (
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="mr-2 text-green-600" size={20} /> Payment Details
                  </h4>
                  <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.paymentMethod || 'Online Gateway'}</span>
                    </div>
                    {selectedApp.utrNumber && (
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">UTR / Reference No:</span>
                        <span className="font-mono font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">{selectedApp.utrNumber}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Data */}
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="mr-2 text-green-600" size={20} /> Personal Details
                  </h4>
                  <div className="space-y-3 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Father/Husband:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.relation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nationality:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.nationality}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">State:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.state}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs text-gray-400 uppercase font-bold">Address</span>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed mt-1">{selectedApp.address}</p>
                    </div>
                  </div>
                </section>

                {/* Family Life */}
                <section>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="mr-2 text-green-600" size={20} /> Family Life
                  </h4>
                  <div className="space-y-3 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Marital Status:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.maritalStatus}</span>
                    </div>
                    {selectedApp.marriedDetails && (
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Married/Widowed Details</span>
                        <p className="text-sm font-medium text-gray-700 mt-1">{selectedApp.marriedDetails}</p>
                      </div>
                    )}
                    {selectedApp.spouseDetails && (
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Spouse Occupation</span>
                        <p className="text-sm font-medium text-gray-700 mt-1">{selectedApp.spouseDetails}</p>
                      </div>
                    )}
                    {selectedApp.childrenDetails && (
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Children Details</span>
                        <p className="text-sm font-medium text-gray-700 mt-1">{selectedApp.childrenDetails}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200/50">
                      <span className="text-gray-500">Army Dependent:</span>
                      <span className="font-semibold text-gray-800">{selectedApp.armyDependent}</span>
                    </div>
                  </div>
                </section>

                {/* Experience Detail */}
                <section className="md:col-span-2">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="mr-2 text-green-600" size={20} /> Present / Previous Experience
                  </h4>
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Has Experience</span>
                        <p className="font-bold text-gray-800">{selectedApp.hasExperience}</p>
                      </div>
                      
                      {selectedApp.hasExperience === 'Yes' && (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Designation</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_designation}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Institution</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_institution}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Superior In-charge</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_superior_designation}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Superior Contact</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_superior_contact}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Notice Period</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_notice_period}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Salary Drawn</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_salary}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Total Exp Years</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_total_years}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Exp Role/School</span>
                            <p className="font-bold text-gray-800">{selectedApp.exp_role_type} at {selectedApp.exp_school_college}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {/* CSB & CTET Detail */}
                <section className="md:col-span-2">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="mr-2 text-green-600" size={20} /> CSB & CTET Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600">CSB Qualified:</span>
                      <span className="font-bold text-green-700">{selectedApp.csb} {selectedApp.csbPercent ? `(${selectedApp.csbPercent}%)` : ''}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600">CTET Qualified:</span>
                      <span className="font-bold text-green-700">{selectedApp.ctet} {selectedApp.ctetPercent ? `(${selectedApp.ctetPercent}%)` : ''}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Educational Qualifications Table */}
              <section>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="mr-2 text-green-600" size={20} /> Educational Qualifications
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Examination</th>
                        <th className="px-6 py-4">Board / Institute</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Year</th>
                        <th className="px-6 py-4">Marks Obtained</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {['highSchool', 'intermediate', 'graduation', 'professional', 'postGraduation', 'anyOther'].map(id => {
                        const label = {
                          highSchool: 'High School',
                          intermediate: 'Intermediate',
                          graduation: 'Graduation',
                          professional: 'Professional (B.Ed/etc)',
                          postGraduation: 'Post Graduation',
                          anyOther: 'Other'
                        }[id];
                        
                        return selectedApp[`edu_${id}_board`] ? (
                          <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-700">{label}</td>
                            <td className="px-6 py-4 text-gray-600">{selectedApp[`edu_${id}_board`]}</td>
                            <td className="px-6 py-4 text-gray-600">{selectedApp[`edu_${id}_subject`]}</td>
                            <td className="px-6 py-4 text-gray-600">{selectedApp[`edu_${id}_year`]}</td>
                            <td className="px-6 py-4 text-gray-600">{selectedApp[`edu_${id}_marks`]}</td>
                            <td className="px-6 py-4 text-gray-600">{selectedApp[`edu_${id}_totalMarks`]}</td>
                            <td className="px-6 py-4 font-bold text-green-700">{selectedApp[`edu_${id}_percent`]}%</td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Uploaded Documents */}
              <section>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 text-green-600" size={20} /> Uploaded Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(selectedApp)
                    .filter(key => (key.includes('file') || key === 'photoSignature' || key === 'receiptUrl') && selectedApp[key] && selectedApp[key].startsWith('http'))
                    .map(key => (
                      <a 
                        key={key}
                        href={selectedApp[key]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <Download size={20} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{getFileLabel(key)}</span>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-green-600" />
                      </a>
                    ))
                  }
                  {Object.keys(selectedApp).filter(key => (key.includes('file') || key === 'photoSignature' || key === 'receiptUrl') && selectedApp[key] && selectedApp[key].startsWith('http')).length === 0 && (
                    <p className="col-span-full text-center py-6 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      No files available for this applicant
                    </p>
                  )}
                </div>
              </section>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {selectedApp.status !== 'Paid' && (
                  <button 
                    onClick={() => confirmPayment(selectedApp.id)}
                    className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md flex items-center"
                  >
                    Confirm Payment
                  </button>
                )}
                <button 
                  onClick={() => deleteApplication(selectedApp.id)}
                  className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center"
                >
                  <Trash2 size={18} className="mr-2" /> Delete
                </button>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center"
              >
                <Download size={18} className="mr-2" /> Print Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}} />
    </div>
  );
}
