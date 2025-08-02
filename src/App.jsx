import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import CustomerMenu from './pages/CustomerMenu';
import OrderTracking from './pages/OrderTracking';
import KitchenDashboard from './pages/KitchenDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Test from './pages/Test';
import TestLanding from './pages/TestLanding';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#f0681a',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <Router>
          <div className="App">
            <Routes>
              {/* Customer routes */}
              <Route path="/menu/:restaurantId/:tableNumber" element={<CustomerMenu />} />
              <Route path="/order/:orderId/tracking" element={<OrderTracking />} />
              
              {/* Staff routes */}
              <Route path="/kitchen/:restaurantId" element={<KitchenDashboard />} />
              <Route path="/staff/:restaurantId" element={<StaffDashboard />} />
              
              {/* Admin routes */}
              <Route path="/admin/:restaurantId" element={<AdminDashboard />} />
              
              {/* Test route */}
              <Route path="/test" element={<Test />} />
              
              {/* Default route */}
              <Route path="/" element={<TestLanding />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="bottom-center" />
          </div>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;