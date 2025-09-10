import '@testing-library/jest-dom';
import React from 'react';
import { test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders primary button and handles click', () => {
  const onClick = jest.fn();
  render(<Button variant="primary" onClick={onClick}>Go</Button>);
  const btn = screen.getByRole('button', { name: /go/i });
  expect(btn).toHaveClass('from-blue-900');
  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});