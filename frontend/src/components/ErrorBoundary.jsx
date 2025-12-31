import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (in production, you'd send this to an error reporting service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">
                            เกิดข้อผิดพลาด
                        </h1>
                        <p className="text-slate-600 mb-6">
                            ขออภัย เกิดข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าเว็บหรือติดต่อผู้ดูแลระบบ
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                รีเฟรชหน้าเว็บ
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null, errorInfo: null });
                                    window.location.href = '/dashboard';
                                }}
                                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
                            >
                                กลับหน้าหลัก
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm font-bold text-slate-500 mb-2">
                                    รายละเอียดข้อผิดพลาด (Development Only)
                                </summary>
                                <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-auto max-h-60">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;



