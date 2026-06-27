import { ConfigProvider } from 'antd';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563EB',
          colorSuccess: '#22C55E',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorBgBase: '#F8FAFC',
          fontFamily: "'Inter', sans-serif",
          borderRadius: 6,
        },
        components: {
          Layout: {
            headerBg: '#ffe5e0',
            siderBg: '#ffffff',
            bodyBg: '#F8FAFC',
          },
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;