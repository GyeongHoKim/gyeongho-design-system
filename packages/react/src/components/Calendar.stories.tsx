import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Calendar } from './Calendar.js';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return <Calendar value={date} onSelect={setDate} aria-label="Choose a date" />;
  },
};

export const WithSelection: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return <Calendar value={date} onSelect={setDate} aria-label="Choose a date" />;
  },
};

export const WithDisabledWeekends: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <Calendar
        value={date}
        onSelect={setDate}
        isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
        aria-label="Choose a weekday"
      />
    );
  },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Calendar defaultValue={new Date()} aria-label="Choose a date" />
    </div>
  ),
};
