'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { createContext, useContext, useState } from 'react';
import { Button } from './button';
import { ChevronDown } from 'lucide-react';

type AccordionContextValue = {
  openItems: string[];
  toggle: (v: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = 'single', defaultValue, className, children, ...props }, ref) => {
    const [openItems, setOpenItems] = useState<string[]>(
      Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
    );

    const toggle = (value: string) => {
      setOpenItems((prev) => {
        const has = prev.includes(value);
        if (type === 'single') return has ? [] : [value];
        return has ? prev.filter((i) => i !== value) : [...prev, value];
      });
    };

    return (
      <AccordionContext.Provider value={{ openItems, toggle }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const ctx = useContext(AccordionContext);
    const isOpen = ctx?.openItems.includes(value);
    return (
      <div
        ref={ref}
        data-state={isOpen ? 'open' : 'closed'}
        className={cn(
          'border rounded-lg p-1 overflow-hidden transition-all',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { _value: value });
          }
          return child;
        })}
      </div>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  _value?: string;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ _value, className, children, ...props }, ref) => {
    const ctx = useContext(AccordionContext);
    const isOpen = _value ? ctx?.openItems.includes(_value) : false;
    return (
      <Button
        ref={ref as any}
        variant="ghost"
        onClick={() => _value && ctx?.toggle(_value)}
        className={cn('w-full justify-between px-4 py-5', className)}
        {...props as any}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </Button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  _value?: string;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ _value, className, children, ...props }, ref) => {
    const ctx = useContext(AccordionContext);
    const isOpen = _value ? ctx?.openItems.includes(_value) : false;
    if (!isOpen) return null;
    return (
      <div
        ref={ref}
        className={cn('px-4 pb-4 pt-0 text-sm', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
