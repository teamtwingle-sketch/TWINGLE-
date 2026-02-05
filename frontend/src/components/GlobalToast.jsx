import React, { lazy, Suspense } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load ToastContainer and its CSS to reduce initial bundle size
// We create a wrapper to handle the CSS import inside the lazy boundary
// note: importing CSS in a component may still bundle it in main if not careful, 
// but lazy-loading the component usually splits the CSS into that chunk if using Vite.

const LazyToastContainer = lazy(() =>
    import('react-toastify').then(module => {
        // We also need to import the CSS here or ensure it's loaded only when this component is loaded.
        // However, JS-based CSS import works best if we just return the component.
        // The CSS import 'react-toastify/dist/ReactToastify.css' must be done dynamically or in a file that is lazy loaded.
        return { default: module.ToastContainer };
    })
);

export default function GlobalToast() {
    // We use a side-effect to load CSS or just assume it is loaded by the lazy import if we put the css import in a wrapper file.
    // But since we can't easily dynamic import CSS in the 'then' block for side effects without a separate file often,
    // let's try to import the CSS in THIS file? No, this file is synchronously imported by App? 
    // No, we will lazy load this file from App.

    return <LazyToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-4 px-4 sm:px-0"
        toastClassName="!rounded-2xl !shadow-xl !backdrop-blur-md !bg-white/90 !text-slate-800 !font-medium !border !border-slate-100/50"
        bodyClassName="!p-0 !m-0 !flex !items-center !gap-3"
    />;
}
