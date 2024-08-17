import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CookiesProvider } from 'react-cookie'
import Login from './Routes/Login'
import Register from './Routes/Register'
import UserSettings from './Routes/Settings/UserSettings'
import CosmeticsSettings from './Routes/Settings/CosmeticsSettings'
import SecuritySettings from './Routes/Settings/SecuritySettings'
import ContactTablePage from './Routes/ContactTablePage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'


const queryClient = new QueryClient()

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [

            {
                path: "home",
                element: <ContactTablePage />,
            },
            {
                path: "auth",
                children: [
                    {
                        path: "login",
                        element: <Login />,
                    },
                    {
                        path: "register",
                        element: <Register />,
                    },
                ]
            },
            {
                path: "settings",
                element: <UserSettings />,
                children: [
                    {
                        path: "cosmetics",
                        element: <CosmeticsSettings />
                    },
                    {
                        path: "security",
                        element: <SecuritySettings />
                    },
                    {
                        path: "*",
                        index: true,
                        loader: () => redirect("cosmetics"),

                    }
                ]
            },
        ]
    },
    {
        path: "*",
        loader: () => redirect("/")
    }
])


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CookiesProvider defaultSetOptions={{
            path: "/"
        }}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </CookiesProvider>
    </React.StrictMode>
)
