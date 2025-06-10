import { ComponentType } from 'react';
import { ShoppingCartProvider } from '@/app/contexts/ShoppingCartContext';

export function withShoppingCart<T extends {}>(WrappedComponent: ComponentType<T>) {
  return function WithShoppingCartWrapper(props: T) {
    return (
      <ShoppingCartProvider>
        <WrappedComponent {...props} />
      </ShoppingCartProvider>
    );
  };
}
