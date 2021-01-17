import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { always, cond, equals, T } from 'ramda'
import DynamicRoute from './index'
import "regenerator-runtime/runtime.js"
import '@testing-library/jest-dom/extend-expect'

const PageA = () => <div>aa</div>
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
  test('/aa 로 접근하면 PageA 가 로드되어야 한다', async () => {
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

  test('/bb 로 접근하면 PageB 가 로드되어야 한다', async () => {
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

  test('/blabla 로 접근하면 404.js 가 로드되어야 한다', async () => {
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

  test('Loading chunk d+ failed', async () => {
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
})
