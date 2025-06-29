import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { ToastContainer } from "react-fox-toast";

import "./tailwind.css";

// Custom toast styles
const toastStyles = `
  .fox-toast-container {
    position: fixed;
    z-index: 9999;
    padding: 1rem;
    box-sizing: border-box;
    min-width: 320px;
  }
  
  .fox-toast-container.bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .fox-toast-container .fox-toast {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-bottom: 1rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    min-width: 300px;
    max-width: 520px;
    animation: slideUp 0.3s ease forwards;
  }
  
  .fox-toast-container .fox-toast.success {
    border-left: 4px solid #10B981;
  }
  
  .fox-toast-container .fox-toast.error {
    border-left: 4px solid #EF4444;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: toastStyles }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Register Service Worker
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }

  return (
    <>
      <Outlet />
      <ToastContainer position="bottom-center" />
    </>
  );
}
