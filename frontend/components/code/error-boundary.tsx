import { logClientError } from '@/lib/utils';

import React, { ReactNode } from 'react';

// Define the state interface
interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

// Define the props interface
interface ErrorBoundaryProps {
    children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        logClientError(error.message, 'ErrorBoundary');
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div className="text-red-500 p-4">Error: {this.state.errorMessage}</div>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
