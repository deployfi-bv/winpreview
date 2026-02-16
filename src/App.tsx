import { AppShell } from '@/components/layout/AppShell';

import { AppProvider } from '@/hooks/useAppState';

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
