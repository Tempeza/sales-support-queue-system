import React, { useState, useRef, useEffect } from 'react';
import { User, Role } from '../types';
import { BriefcaseIcon, PaintBrushIcon } from './icons';
import { ThemeName } from '../App';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentTheme: ThemeName;
  onChangeTheme: (themeName: ThemeName) => void;
}

const themeOptions: { name: ThemeName; bgClass: string; }[] = [
  { name: 'indigo', bgClass: 'bg-indigo-500' },
  { name: 'sky', bgClass: 'bg-sky-500' },
  { name: 'emerald', bgClass: 'bg-emerald-500' },
  { name: 'rose', bgClass: 'bg-rose-500' },
];

const Header: React.FC<HeaderProps> = ({ user, onLogout, currentTheme, onChangeTheme }) => {
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const roleColors = {
    [Role.Sales]: 'bg-blue-100 text-blue-800',
    [Role.Support]: 'bg-purple-100 text-purple-800',
  };
  
  const fullName = `${user.firstName} ${user.lastName}`;
  
  // Handle clicking outside the picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsThemePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef]);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">บอร์ดงานขาย</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={pickerRef}>
                <button
                    onClick={() => setIsThemePickerOpen(prev => !prev)}
                    className="p-1 rounded-full text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    title="เปลี่ยนธีมสี"
                    aria-haspopup="true"
                    aria-expanded={isThemePickerOpen}
                >
                    <PaintBrushIcon className="w-6 h-6" />
                </button>
                {isThemePickerOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10 p-2">
                    <p className="text-sm font-medium text-gray-700 px-1 pb-1">เลือกธีม</p>
                    <div className="grid grid-cols-2 gap-2">
                    {themeOptions.map((theme) => (
                        <button
                        key={theme.name}
                        onClick={() => {
                            onChangeTheme(theme.name);
                            setIsThemePickerOpen(false);
                        }}
                        className={`w-full h-8 rounded-md flex items-center justify-center relative ${theme.bgClass}`}
                        title={theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                        aria-label={`Select ${theme.name} theme`}
                        >
                        {currentTheme === theme.name && (
                            <span className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </span>
                        )}
                        </button>
                    ))}
                    </div>
                </div>
                )}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{fullName}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                {user.role === Role.Sales ? 'ฝ่ายขาย' : 'ซัพพอร์ต'}
              </span>
            </div>
            {user.avatarUrl ? (
                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={fullName} />
            ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {user.firstName.charAt(0)}
                </div>
            )}
             <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-500 hover:text-primary-600"
              title="ออกจากระบบ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;