# Calendar Date Picker Feature

## Overview
A neat and simple calendar date picker has been added to the Bank and Portfolio (Demat) pages for better date selection when adding transactions and investments.

## Features

### Visual Calendar Interface
- Beautiful calendar grid with month/year navigation
- Left/Right arrows to navigate between months
- Highlighted "Today" for easy reference
- Selected date highlighted in blue
- Today's date shown with a blue border

### Functionality
- Click any date in the calendar to select it
- Use "Today" button at the bottom for quick selection
- Navigate months using arrow buttons
- Smooth dropdown with z-index management
- Closes automatically after date selection

## Integration Points

### 1. Bank Management - Transactions
When adding a new transaction (Expense or Income):
- **Location**: Bank Accounts & Transactions page → Add Transaction button
- **Date Field**: Shows as calendar picker instead of HTML date input
- **Use Case**: Select transaction date for expenses and income

### 2. Portfolio Management - Investments
When adding stocks to demat account:
- **Location**: Portfolio page → Add Investment button
- **Date Field**: Buy Date now uses calendar picker
- **Use Case**: Select purchase date for stock investments

## How to Use

### For End Users
1. Click on the date field (it shows the current date or "Select Date")
2. A calendar appears with the current month
3. Navigate months using arrow buttons
4. Click on any date to select it
5. Or click "Today" button to quickly select today's date
6. Calendar closes automatically after selection

### For Developers
The DatePicker component is reusable:

```jsx
import DatePicker from './components/DatePicker';

<DatePicker 
  value={dateValue}  // YYYY-MM-DD format
  onChange={handleDateChange}  // Callback function
  label="Select a date"  // Optional label
/>
```

## Component Details

**File**: `frontend/src/components/DatePicker.jsx`

**Props**:
- `value` (string): Date in YYYY-MM-DD format
- `onChange` (function): Callback when date is selected
- `label` (string, optional): Placeholder text when no date is selected

**Features**:
- Responsive design
- Dark theme matching the app
- Keyboard friendly
- Shows today's date with special styling
- Current selection highlighted in blue
- Today button for quick access
- Month/year navigation with arrow buttons

## Styling
- Uses existing Tailwind CSS classes from the app
- Matches the dark theme (gray-800, gray-700, blue-600)
- Proper z-index (z-50) to appear above other elements
- Smooth transitions and hover effects

## Browser Compatibility
- Works in all modern browsers
- Uses standard JavaScript Date API
- No external date library dependencies
- Lightweight and performant
