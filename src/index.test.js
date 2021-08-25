import React from "react"
import { useEffect } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter, useHistory } from "react-router-dom"
import { always, cond, equals, T } from "ramda"
import DynamicRoute from "./index"
import "regenerator-runtime/runtime.js"
import "@testing-library/jest-dom/extend-expect"
import userEvent from "@testing-library/user-event"

import * as index from "./index"
const PageA = ({ callback }) => {
  const history = useHistory()
  useEffect(() => {
    callback?.()
  })
  return (
    <div>
      aa <button onClick={() => history.push('/bb')}>go bb</button>
      <button onClick={() => history.push('/aa')}>go aa</button>
      <button onClick={() => history.push('/aa?xx=1')}>go aa with search param</button>
    </div>
  )
}
const PageB = () => <div>bb</div>
const NotFound = () => <div>404</div>

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, { wrapper: BrowserRouter })
}

const loader = cond([
  [equals('./pages/aa'), always(Promise.resolve({ default: PageA }))],
  [equals('./pages/bb'), always(Promise.resolve({ default: PageB }))],
  [equals('./pages/404'), always(Promise.resolve({ default: NotFound }))],
  [
    equals('./pages/new-js'),
    // eslint-disable-next-line
    async () => {
      throw Error('Loading chunk 34 failed')
    },
  ],
  [
    T,
    // eslint-disable-next-line
    async () => {
      throw Error('not find module')
    },
  ],
  // [T, always(Promise.reject(Error('not find module')))],
])

describe('Routes', () => {
  test('Should load PageA when /aa path accessed', async () => {
    renderWithRouter(
      <DynamicRoute
        page={path => {
          return loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }}
        loading={<div>loading</div>}
      />,
      { route: '/aa' },
    )

    await waitFor(() => {
      const dom = screen.getByText('aa')
      expect(dom).toBeInTheDocument()
    })
  })

  test('Should load PageB when /bb path accessed', async () => {
    renderWithRouter(
      <DynamicRoute
        page={path => {
          return loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }}
        loading={<div>loading</div>}
      />,
      { route: '/bb' },
    )

    await waitFor(() => {
      const dom = screen.getByText('bb')
      expect(dom).toBeInTheDocument()
    })
  })

  test('Should load 404.js when access /blabla path', async () => {
    renderWithRouter(
      <DynamicRoute
        page={path => {
          return loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }}
        loading={<div>loading</div>}
      />,
      { route: '/blabla' },
    )

    await waitFor(() => {
      const dom = screen.getByText('404')
      expect(dom).toBeInTheDocument()
    })
  })

  test('Should reload page when Loading chunk d+ failed', async () => {
    const reload = jest.fn()
    renderWithRouter(
      <DynamicRoute
        page={path =>
          loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }
        loading={<div>loading</div>}
        onError={(e, history) => {
          if (/Loading chunk \d+ failed/.test(e.message)) {
            // https://madup.atlassian.net/browse/MA-644
            reload()
            return
          }
          throw e
        }}
      />,
      { route: '/new-js' },
    )

    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1)
    })
  })

  test('Should be loaded loading component when pending', () => {

  })

  test('should be rendered once when same pathname', async () => {
    const reload = jest.fn()
    const callback = jest.fn()
    renderWithRouter(
      <DynamicRoute
        page={path =>
          loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }
        loading={<div>loading</div>}
        onError={(e, history) => {
          if (/Loading chunk \d+ failed/.test(e.message)) {
            // https://madup.atlassian.net/browse/MA-644
            reload()
            return
          }
          throw e
        }}
        props={{callback}}
      />,
      { route: '/aa' },
    )

    await waitFor(() => {
      const dom = screen.getByText('aa')
      expect(dom).toBeInTheDocument()
      expect(callback).toHaveBeenCalledTimes(1)
    })

    userEvent.click(screen.getByText('go aa'))

    await waitFor(() => {
      expect(screen.getByText('aa')).toBeInTheDocument()
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  test('should be re rendered when different search param', async () => {
    const reload = jest.fn()
    const callback = jest.fn()
    renderWithRouter(
      <DynamicRoute
        page={path =>
          loader('./pages' + path)
            .then(module => module.default)
            .catch(e => {
              if (/not find module/.test(e.message)) {
                return loader('./pages/404').then(module => module.default)
              }
              throw e
            })
        }
        loading={<div>loading</div>}
        onError={(e, history) => {
          if (/Loading chunk \d+ failed/.test(e.message)) {
            // https://madup.atlassian.net/browse/MA-644
            reload()
            return
          }
          throw e
        }}
        props={{callback}}
      />,
      { route: '/aa' },
    )

    await waitFor(() => {
      const dom = screen.getByText('aa')
      expect(dom).toBeInTheDocument()
      expect(callback).toHaveBeenCalledTimes(1)
    })

    userEvent.click(screen.getByText('go aa with search param'))

    await waitFor(() => {
      expect(screen.getByText('aa')).toBeInTheDocument()
      expect(callback).toHaveBeenCalledTimes(3)
    })
  })
})

// @ponicode
describe("index.AsyncComponent", () => {
    test("0", () => {
        let callFunction = () => {
            index.AsyncComponent({ component: true, onError: "callback detected, not supported yet", history: "https://", path: "./path/to/file", search: "UNLOCK TABLES;", loading: "https://", otherProps: 12345 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            index.AsyncComponent({ component: false, onError: "callback detected, not supported yet", history: "http://www.croplands.org/account/confirm?t=", path: "./path/to/file", search: "SELECT * FROM Movies WHERE Title=’Jurassic Park’ AND Director='Steven Spielberg';", loading: "https://api.telegram.org/bot", otherProps: 12345 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            index.AsyncComponent({ component: true, onError: false, history: "https://croplands.org/app/a/confirm?t=", path: "C:\\\\path\\to\\file.ext", search: "DROP TABLE tmp;", loading: "http://example.com/showcalendar.html?token=CKF50YzIHxCTKMAg", otherProps: 987650 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            index.AsyncComponent({ component: false, onError: "callback detected, not supported yet", history: "https://accounts.google.com/o/oauth2/revoke?token=%s", path: "/path/to/file", search: "SELECT * FROM Movies WHERE Title=’Jurassic Park’ AND Director='Steven Spielberg';", loading: "https://", otherProps: 56784 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            index.AsyncComponent({ component: true, onError: true, history: "https://api.telegram.org/bot", path: "C:\\\\path\\to\\file.ext", search: "DROP TABLE tmp;", loading: "https://croplands.org/app/a/reset?token=", otherProps: 987650 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            index.AsyncComponent(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
