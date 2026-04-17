// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      isPreview: false,
    }
  },
}))

// Mock Clerk hooks - primary auth system
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: false,
    userID: null,
    sessionId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: [],
    has: jest.fn(),
    signOut: jest.fn(),
    getToken: jest.fn(),
  })),
  useUser: jest.fn(() => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  })),
  useSession: jest.fn(() => ({
    isLoaded: true,
    session: null,
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  useSignIn: jest.fn(),
  useSignUp: jest.fn(),
  SignedIn: ({ children }) => children,
  SignedOut: () => null,
  UserButton: () => null,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

jest.mock('next/image', () => (props) => {
  const { src, alt, ...rest } = props
  return require('react').createElement('img', { src, alt, ...rest })
})

class MockResponse {
  constructor(body = null, init = {}) {
    this._body = body
    this.status = init.status ?? 200
    this.headers = {
      get(name) {
        const key = Object.keys(init.headers || {}).find((header) => header.toLowerCase() === name.toLowerCase())
        return key ? init.headers[key] : null
      },
    }
  }

  static json(body, init = {}) {
    return new MockResponse(body, init)
  }

  async json() {
    return this._body
  }
}

global.Response = MockResponse
