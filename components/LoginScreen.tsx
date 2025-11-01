import React, { useState } from 'react';
import { Role, User } from '../types';
import { BriefcaseIcon } from './icons';

interface AuthScreenProps {
  registeredUsers: User[];
  onLogin: (email: string, password_raw: string) => boolean;
  onRegister: (newUser: Omit<User, 'id'>) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ registeredUsers, onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>(Role.Sales);
  const [regAvatar, setRegAvatar] = useState<string | undefined>(undefined);
  
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = onLogin(loginEmail, loginPassword);
    if (!success) {
      setError('Invalid email or password.');
    }
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
        setError('Please fill out all required fields.');
        return;
    }
    if (registeredUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase())) {
        setError('An account with this email already exists.');
        return;
    }

    onRegister({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        avatarUrl: regAvatar
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <BriefcaseIcon className="h-12 w-auto text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistering ? 'Create a new account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {isRegistering ? (
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="firstName" label="First Name" type="text" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
                <InputField id="lastName" label="Last Name" type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
              </div>
              <InputField id="email-reg" label="Email address" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              <InputField id="password-reg" label="Password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select value={regRole} onChange={(e) => setRegRole(e.target.value as Role)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value={Role.Sales}>Sales</option>
                    <option value={Role.Support}>Support</option>
                </select>
              </div>
               <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
                <div className="mt-1 flex items-center space-x-4">
                    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {regAvatar ? <img src={regAvatar} alt="Avatar preview" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    </span>
                    <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
                </div>
              </div>
              <AuthButton text="Register" />
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <InputField id="email" label="Email address" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <InputField id="password" label="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              <AuthButton text="Sign In" />
            </form>
          )}

          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
            </div>
            <div className="mt-6">
              <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isRegistering ? 'Sign in to an existing account' : 'Create a new account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ id, label, type, value, onChange, required = false }: { id: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">
        <input id={id} name={id} type={type} required={required} value={value} onChange={onChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
    </div>
);

const AuthButton = ({ text }: { text: string }) => (
    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        {text}
    </button>
);


export default AuthScreen;
