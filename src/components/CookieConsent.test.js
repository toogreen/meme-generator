import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CookieConsent from './CookieConsent';
import Footer from './Footer';
import { getConsent } from '../consent';

const trackerScripts = () =>
  Array.from(document.head.querySelectorAll('script')).filter(s =>
    /googletagmanager|googlesyndication/.test(s.src)
  );

beforeEach(() => {
  localStorage.clear();
  delete window.__trackersLoaded;
  trackerScripts().forEach(s => s.remove());
});

test('shows the banner on first visit without loading any trackers', () => {
  const { getByText } = render(<CookieConsent />);
  expect(getByText(/Accepter \/ Accept/)).toBeInTheDocument();
  expect(getByText(/Refuser \/ Decline/)).toBeInTheDocument();
  expect(trackerScripts()).toHaveLength(0);
});

test('declining hides the banner and keeps trackers off', () => {
  const { getByText, queryByRole } = render(<CookieConsent />);
  fireEvent.click(getByText(/Refuser \/ Decline/));
  expect(queryByRole('dialog')).toBeNull();
  expect(getConsent()).toBe('denied');
  expect(trackerScripts()).toHaveLength(0);
});

test('accepting loads Google Analytics and AdSense', () => {
  const { getByText } = render(<CookieConsent />);
  fireEvent.click(getByText(/Accepter \/ Accept/));
  expect(getConsent()).toBe('granted');
  const srcs = trackerScripts().map(s => s.src);
  expect(srcs.some(src => src.includes('G-XYLQP27RQQ'))).toBe(true);
  expect(srcs.some(src => src.includes('ca-pub-7401520800104068'))).toBe(true);
});

test('does not show again once a choice is stored, but the footer link reopens it', () => {
  localStorage.setItem('cookieConsent', JSON.stringify({ value: 'denied', date: Date.now() }));
  const { queryByRole, getByText } = render(<><Footer /><CookieConsent /></>);
  expect(queryByRole('dialog')).toBeNull();
  fireEvent.click(getByText(/Témoins \/ Cookies/));
  expect(queryByRole('dialog')).toBeInTheDocument();
});

test('asks again when the stored choice is older than 13 months', () => {
  const old = Date.now() - 1000 * 60 * 60 * 24 * 400;
  localStorage.setItem('cookieConsent', JSON.stringify({ value: 'granted', date: old }));
  const { queryByRole } = render(<CookieConsent />);
  expect(queryByRole('dialog')).toBeInTheDocument();
});
