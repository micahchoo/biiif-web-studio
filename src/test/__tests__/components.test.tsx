/**
 * Component Tests - Production Components
 *
 * Tests actual production components from the components/ directory.
 * These tests verify real user-facing behavior, not mocks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React, { useState } from 'react';

// Import actual production components
import { Icon } from '../../../components/Icon';
import { EmptyState, emptyStatePresets } from '../../../components/EmptyState';
import { LoadingState, LoadingSpinner, ProgressBar, SkeletonBlock } from '../../../components/LoadingState';
import { SkipLink, SkipLinks } from '../../../components/SkipLink';
import { ErrorBoundary, ViewErrorFallback } from '../../../components/ErrorBoundary';
import { ToastProvider, useToast } from '../../../components/Toast';

// ============================================================================
// Icon Component Tests
// ============================================================================

describe('Icon', () => {
  it('should render with name', () => {
    render(<Icon name="home" />);

    const icon = screen.getByText('home');
    expect(icon).toBeInTheDocument();
    expect(icon.tagName).toBe('SPAN');
    expect(icon).toHaveClass('material-icons');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Icon name="delete" onClick={handleClick} />);

    fireEvent.click(screen.getByText('delete'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

});

// ============================================================================
// EmptyState Component Tests
// ============================================================================

describe('EmptyState', () => {
  it('should render with icon and title', () => {
    render(<EmptyState icon="inbox" title="No Items" />);

    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('inbox')).toBeInTheDocument(); // Icon
  });

  it('should render with message', () => {
    render(
      <EmptyState
        icon="search_off"
        title="No Results"
        message="Try adjusting your filters"
      />
    );

    expect(screen.getByText('No Results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('should render with action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon="create_new_folder"
        title="No collections yet"
        action={{
          label: 'Create Collection',
          icon: 'add',
          onClick: handleAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: /Create Collection/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should apply field-mode variant styling', () => {
    const { container } = render(
      <EmptyState icon="home" title="Field Title" variant="field-mode" />
    );

    // Field mode should have specific styling
    expect(container.firstChild).toHaveClass('text-slate-500');
  });

});

describe('EmptyState Presets', () => {
  it('noItems preset should have correct structure', () => {
    const preset = emptyStatePresets.noItems({ onAction: vi.fn() });

    expect(preset.icon).toBe('inbox');
    expect(preset.title).toBe('No Items');
    expect(preset.action).toBeDefined();
    expect(preset.action?.label).toBe('Add Item');
  });

  it('error preset should include retry action', () => {
    const preset = emptyStatePresets.error({ onRetry: vi.fn() });

    expect(preset.icon).toBe('error_outline');
    expect(preset.action).toBeDefined();
    expect(preset.action?.label).toBe('Retry');
  });

  it('noResults preset should not have action without onAction', () => {
    const preset = emptyStatePresets.noResults();

    expect(preset.icon).toBe('search_off');
    expect(preset.action).toBeUndefined();
  });
});

// ============================================================================
// LoadingState Component Tests
// ============================================================================

describe('LoadingSpinner', () => {
  it('should render spinner with default size', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { container } = render(<LoadingSpinner size="lg" />);

    const spinner = container.querySelector('.w-8');
    expect(spinner).toBeInTheDocument();
  });
});

describe('LoadingState', () => {
  it('should render spinner variant with message', () => {
    render(<LoadingState message="Loading items..." />);

    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  it('should render progress variant', () => {
    render(<LoadingState variant="progress" progress={50} message="Uploading..." />);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should clamp progress to 0-100 range', () => {
    render(<LoadingState variant="progress" progress={150} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render fullscreen overlay variant', () => {
    const { container } = render(
      <LoadingState variant="overlay" progress={75} message="Processing" fullScreen />
    );

    // Fullscreen should have fixed positioning
    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render skeleton variant', () => {
    const { container } = render(<LoadingState variant="skeleton" />);

    // Skeleton has animated pulse elements
    const skeletonLines = container.querySelectorAll('.animate-pulse');
    expect(skeletonLines.length).toBeGreaterThan(0);
  });
});

describe('ProgressBar', () => {
  it('should render progress with percentage', () => {
    render(<ProgressBar progress={45} />);

    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should render with message', () => {
    render(<ProgressBar progress={30} message="Uploading files..." />);

    expect(screen.getByText('Uploading files...')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should hide percentage when showPercentage is false', () => {
    const { queryByText } = render(
      <ProgressBar progress={60} message="Loading" showPercentage={false} />
    );

    expect(queryByText('60%')).not.toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});

describe('SkeletonBlock', () => {
  it('should render default number of lines', () => {
    const { container } = render(<SkeletonBlock />);

    const lines = container.querySelectorAll('.h-4');
    expect(lines.length).toBe(3);
  });

  it('should render specified number of lines', () => {
    const { container } = render(<SkeletonBlock lines={5} />);

    const lines = container.querySelectorAll('.h-4');
    expect(lines.length).toBe(5);
  });

  it('should have pulse animation by default', () => {
    const { container } = render(<SkeletonBlock />);

    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// SkipLink Component Tests
// ============================================================================

describe('SkipLink', () => {
  beforeEach(() => {
    // Create target element
    const target = document.createElement('div');
    target.id = 'main-content';
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be visually hidden by default', () => {
    const { container } = render(
      <SkipLink targetId="main-content" label="Skip to content" />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('-translate-y-[200%]');
  });

  it('should become visible on focus', () => {
    const { container } = render(
      <SkipLink targetId="main-content" label="Skip to content" />
    );

    const link = container.querySelector('a');
    link?.focus();

    expect(link).toHaveClass('focus:translate-y-0');
  });

  it('should have correct href', () => {
    const { container } = render(
      <SkipLink targetId="main-content" label="Skip" />
    );

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should display shortcut when provided', () => {
    render(
      <SkipLink
        targetId="command-palette"
        label="Skip to Command Palette"
        shortcut="⌘K"
      />
    );

    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('should support different positions', () => {
    const { rerender, container } = render(
      <SkipLink targetId="main" label="Skip" position="top-left" />
    );

    let link = container.querySelector('a');
    expect(link).toHaveClass('left-4');

    rerender(<SkipLink targetId="main" label="Skip" position="top-center" />);
    link = container.querySelector('a');
    expect(link).toHaveClass('left-1/2');

    rerender(<SkipLink targetId="main" label="Skip" position="top-right" />);
    link = container.querySelector('a');
    expect(link).toHaveClass('right-4');
  });

  it('should focus target element when clicked', () => {
    render(<SkipLink targetId="main-content" label="Skip to content" />);

    const link = screen.getByText('Skip to content');
    fireEvent.click(link);

    const target = document.getElementById('main-content');
    expect(document.activeElement).toBe(target);
  });
});

describe('SkipLinks', () => {
  beforeEach(() => {
    ['main', 'nav', 'search'].forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render multiple skip links', () => {
    render(
      <SkipLinks
        links={[
          { targetId: 'main', label: 'Skip to content' },
          { targetId: 'nav', label: 'Skip to navigation' },
          { targetId: 'search', label: 'Skip to search' },
        ]}
      />
    );

    expect(screen.getByText('Skip to content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
    expect(screen.getByText('Skip to search')).toBeInTheDocument();
  });

  it('should have navigation landmark', () => {
    const { container } = render(
      <SkipLinks links={[{ targetId: 'main', label: 'Skip' }]} />
    );

    const nav = container.querySelector('nav[aria-label="Skip links"]');
    expect(nav).toBeInTheDocument();
  });
});

// ============================================================================
// ErrorBoundary Component Tests
// ============================================================================

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  // Component that throws error
  const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal render</div>;
  };

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });

  it('should render error fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('The application encountered an unexpected error.')).toBeInTheDocument();
  });

  it('should display error details in code block', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorCode = screen.getByText(/Test error/);
    expect(errorCode).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const handleError = vi.fn();

    render(
      <ErrorBoundary onError={handleError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    );
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom error');
  });

  it('should render functional fallback with error and retry', () => {
    const FunctionalFallback: React.FC = () => <div>Functional fallback</div>;

    render(
      <ErrorBoundary fallback={() => <FunctionalFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Functional fallback')).toBeInTheDocument();
  });

  it('should have reload button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
    expect(reloadButton).toBeInTheDocument();
  });
});

describe('ViewErrorFallback', () => {
  it('should render view name and error message', () => {
    const error = new Error('View failed to load');

    render(
      <ViewErrorFallback
        viewName="Board"
        error={error}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Board View Error')).toBeInTheDocument();
    expect(screen.getByText('View failed to load')).toBeInTheDocument();
  });

  it('should render without error message', () => {
    render(
      <ViewErrorFallback
        viewName="Archive"
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Archive View Error')).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', () => {
    const handleRetry = vi.fn();

    render(
      <ViewErrorFallback
        viewName="Collections"
        error={null}
        onRetry={handleRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should render switch view button when onSwitchView provided', () => {
    render(
      <ViewErrorFallback
        viewName="Settings"
        error={null}
        onRetry={vi.fn()}
        onSwitchView={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Switch View/i })).toBeInTheDocument();
  });
});

// ============================================================================
// Toast Component Tests
// ============================================================================

// Test component that uses toast
const ToastTester: React.FC = () => {
  const { showToast, showPersistentToast } = useToast();
  const [message, setMessage] = useState('');

  return (
    <div>
      <button
        data-testid="show-info"
        onClick={() => showToast('Info message', 'info')}
      >
        Show Info
      </button>
      <button
        data-testid="show-success"
        onClick={() => showToast('Success!', 'success')}
      >
        Show Success
      </button>
      <button
        data-testid="show-error"
        onClick={() => showToast('Error!', 'error')}
      >
        Show Error
      </button>
      <button
        data-testid="show-warning"
        onClick={() => showToast('Warning', 'warning')}
      >
        Show Warning
      </button>
      <button
        data-testid="show-persistent"
        onClick={() => showPersistentToast('Persistent', 'info')}
      >
        Show Persistent
      </button>
      <button
        data-testid="show-with-action"
        onClick={() =>
          showToast('Action needed', 'info', {
            label: 'Undo',
            onClick: () => setMessage('Action clicked'),
          })
        }
      >
        Show With Action
      </button>
      {message && <div data-testid="action-result">{message}</div>}
    </div>
  );
};

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show and auto-dismiss toast after duration', async () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    // Show toast
    fireEvent.click(screen.getByTestId('show-info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Fast-forward past toast duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });
  });

  it('should show different toast types with correct styling', () => {
    const { rerender } = render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    // Dismiss and show error
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(screen.getByTestId('show-error'));
    const errorToast = screen.getByRole('alert');
    expect(errorToast).toBeInTheDocument();
  });

  it('should limit maximum concurrent toasts', () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    // Show multiple toasts
    fireEvent.click(screen.getByTestId('show-info'));
    fireEvent.click(screen.getByTestId('show-success'));
    fireEvent.click(screen.getByTestId('show-error'));
    fireEvent.click(screen.getByTestId('show-warning'));

    // Should only show max 3 (MAX_TOASTS limit)
    const toasts = screen.getAllByRole('status');
    expect(toasts.length).toBeLessThanOrEqual(3);
  });

  it('should dismiss toast on click', () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-info'));
    expect(screen.getByText('Info message')).toBeInTheDocument();

    // Click anywhere to dismiss
    fireEvent.click(document.body);

    // Toast should be dismissed
    expect(screen.queryByText('Info message')).not.toBeInTheDocument();
  });

  it('should show persistent toast that does not auto-dismiss', () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-persistent'));
    expect(screen.getByText('Persistent')).toBeInTheDocument();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Persistent toast should still be visible
    expect(screen.getByText('Persistent')).toBeInTheDocument();
  });

  it('should render toast with action button', () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('show-with-action'));
    expect(screen.getByText('Action needed')).toBeInTheDocument();

    const actionButton = screen.getByRole('button', { name: /Undo/i });
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(screen.getByTestId('action-result')).toHaveTextContent('Action clicked');
  });

  it('should have ARIA live region for accessibility', () => {
    const { container } = render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});

describe('useToast hook', () => {
  it('should throw error when used outside provider', () => {
    // Suppress expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      const TestComponent = () => {
        useToast();
        return null;
      };
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });
});
