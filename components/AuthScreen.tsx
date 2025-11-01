import React, { useState } from 'react';
import { Role, User } from '../types';
import { BriefcaseIcon } from './icons';

interface AuthScreenProps {
  onLogin: (email: string, password_raw: string) => Promise<boolean>;
  onRegister: (newUser: Omit<User, 'id'>) => Promise<void>;
}

const InputField = ({ id, label, type, value, onChange, required = false, disabled = false }: { id: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; disabled?: boolean; }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">
        <input id={id} name={id} type={type} required={required} value={value} onChange={onChange} disabled={disabled} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50" />
      </div>
    </div>
);

const AuthButton = ({ text, loading }: { text: string, loading?: boolean }) => (
    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed">
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : text}
    </button>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
        await onLogin(loginEmail, loginPassword);
        // On success, App component will set user and this component will unmount.
    } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
        setLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
        setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        return;
    }

    setLoading(true);
    try {
        await onRegister({
            firstName: regFirstName,
            lastName: regLastName,
            email: regEmail,
            password: regPassword,
            role: regRole,
            avatarUrl: regAvatar
        });
        // On success, App component will set user and this component will unmount.
    } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <BriefcaseIcon className="h-12 w-auto text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistering ? 'สร้างบัญชีใหม่' : 'ลงชื่อเข้าใช้บัญชีของคุณ'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {isRegistering ? (
            <form className="space-y-6" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="firstName" label="ชื่อจริง" type="text" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required disabled={loading} />
                <InputField id="lastName" label="นามสกุล" type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required disabled={loading} />
              </div>
              <InputField id="email-reg" label="อีเมล" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required disabled={loading} />
              <InputField id="password-reg" label="รหัสผ่าน" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required disabled={loading} />
              <div>
                <label className="block text-sm font-medium text-gray-700">บทบาท</label>
                <select value={regRole} onChange={(e) => setRegRole(e.target.value as Role)} disabled={loading} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md disabled:bg-gray-50">
                    <option value={Role.Sales}>ฝ่ายขาย</option>
                    <option value={Role.Support}>ซัพพอร์ต</option>
                </select>
              </div>
               <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">รูปโปรไฟล์ (ถ้ามี)</label>
                <div className="mt-1 flex items-center space-x-4">
                    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {regAvatar ? <img src={regAvatar} alt="Avatar preview" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    </span>
                    <input id="avatar" type="file" accept="image/*" onChange={handleFileChange} disabled={loading} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"/>
                </div>
              </div>
              <AuthButton text="ลงทะเบียน" loading={loading} />
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <InputField id="email" label="อีเมล" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loading} />
              <InputField id="password" label="รหัสผ่าน" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={loading} />
              <AuthButton text="ลงชื่อเข้าใช้" loading={loading} />
            </form>
          )}

          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">หรือ</span></div>
            </div>
            <div className="mt-6">
              <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} disabled={loading} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                {isRegistering ? 'ลงชื่อเข้าใช้บัญชีที่มีอยู่' : 'สร้างบัญชีใหม่'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;