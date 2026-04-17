import React from 'react'
import { render, screen } from '@testing-library/react'
import Navbar from '@/app/components/Navbar'

jest.mock('@/app/components/NotificationDropdown', () => () => <div data-testid="notification-dropdown" />)

describe('Navbar Component', () => {
  it('sends signed-in users to the feed route from the Home navigation', () => {
    render(<Navbar />)

    const homeLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/home')
    expect(homeLinks.length).toBeGreaterThan(0)
  })

  it('renders the notification dropdown for signed-in navigation', () => {
    render(<Navbar />)

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
  })
})
