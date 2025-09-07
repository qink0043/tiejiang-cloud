import { useTheme } from '../contexts/ThemeContext'
import { theme } from 'antd'

export const useAntdTheme = () => {
  const { isDark } = useTheme()
  const { defaultAlgorithm, darkAlgorithm } = theme

  return {
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    isDark,
  }
}

export default useAntdTheme
