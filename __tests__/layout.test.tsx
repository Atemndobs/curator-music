import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '../app/layout';

describe('RootLayout', () => {
  it('renders children', () => {
    const TestComponent = () => <div>Test Content</div>;
    
    render(
      <RootLayout>
        <TestComponent />
      </RootLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('has correct metadata', () => {
    expect(RootLayout.metadata.title).toBe('Music Curator');
    expect(RootLayout.metadata.description).toBe('A mobile-first music curation app');
  });
});
