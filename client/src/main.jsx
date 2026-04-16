import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContextProvider from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

const routerBase = import.meta.env.VITE_ROUTER_BASENAME || '/roster'

createRoot(document.getElementById('root')).render(
    <BrowserRouter basename={routerBase}>
      <AuthContextProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthContextProvider>
    </BrowserRouter>
)
