import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QrCodeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('QR Code Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert
            message="Lỗi hiển thị mã QR"
            description={
              <div>
                <p>Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại.</p>
                {this.props.onRetry && (
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      this.props.onRetry?.();
                    }}
                    className="mt-2"
                  >
                    Thử lại
                  </Button>
                )}
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}
