import { Button } from 'antd';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

const App = () => {
  return (
    <div className="App">
      <Button type="primary">Button</Button>
      <ThemeToggle />
    </div>
  )
}

export default App