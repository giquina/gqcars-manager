import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Warning, ArrowClockwise, Bug } from "@phosphor-icons/react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Warning size={32} className="text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">
                  Something went wrong
                </h3>
                <p className="text-sm text-muted-foreground">
                  We encountered an unexpected error. Please try again or reload the page.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <ArrowClockwise size={14} />
                  Try Again
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                    <Bug size={12} />
                    Error Details
                  </summary>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                    <div className="text-destructive font-semibold mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <div className="text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different sections
export const MapErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Warning size={24} className="text-amber-500 mx-auto" />
              <p className="text-sm font-medium">Map unavailable</p>
              <p className="text-xs text-muted-foreground">Check your connection and try again</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-xs mt-2"
              >
                <ArrowClockwise size={12} className="mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export const ChatErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <Warning size={20} className="text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium text-destructive">Chat temporarily unavailable</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs mt-2"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}