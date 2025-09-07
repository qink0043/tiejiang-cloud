// src/context/ThemeContext.tsx (或者你喜欢的任何位置)

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { theme as antdTheme } from 'antd'; // 导入 Antd 的 theme 对象

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 创建 Context，并提供默认值
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false, // 默认值为 false
  toggleTheme: () => { }, // 默认是一个空函数
});

interface ThemeProviderProps {
  children: ReactNode;
}

// 创建一个 Provider 组件，用于管理主题状态并提供给子组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // 从 localStorage 获取初始值
    const savedMode = localStorage.getItem('themeMode');
    return savedMode === 'dark';
  });

  useEffect(() => {
    // 主题变化时更新 localStorage
    localStorage.setItem('themeMode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // 提供的 Context 值
  const contextValue = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};