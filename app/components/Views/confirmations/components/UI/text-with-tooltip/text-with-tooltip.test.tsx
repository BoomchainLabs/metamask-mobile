import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TextWithTooltip from './text-with-tooltip';

describe('TextWithTooltip', () => {
  it('renders correctly', async () => {
    const { getByText } = render(
      <TextWithTooltip
        label={'some_dummy_label'}
        text={'some_dummy_value'}
        tooltip={'some_dummy_tooltip'}
      />,
    );
    expect(getByText('some_dummy_value')).toBeDefined();
  });

  it('should open modal when value pressed', async () => {
    const { getByTestId, getByText } = render(
      <TextWithTooltip
        label={'some_dummy_label'}
        text={'some_dummy_value'}
        tooltip={'some_dummy_tooltip'}
      />,
    );
    expect(getByText('some_dummy_value')).toBeDefined();
    fireEvent.press(getByText('some_dummy_value'));
    expect(getByText('some_dummy_label')).toBeDefined();
    expect(getByText('some_dummy_tooltip')).toBeDefined();
    fireEvent.press(getByTestId('tooltipTestId'));
    expect(getByText('some_dummy_value')).toBeDefined();
  });
});
