import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">error</span>
            <h2 className="font-headline text-xl font-extrabold tracking-tighter mb-2">Something went wrong</h2>
            <p className="text-sm text-[#45464d] mb-6">An unexpected error occurred.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="bg-[#191c1e] text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest">Refresh</button>
              <Link to="/" className="bg-[#f2f4f6] text-[#191c1e] px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest">Home</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
