import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

export function AsyncComponent(props) {
  const [Component, setComponent] = useState(null)

  useEffect(() => {
    let cleanedUp = false
    props.module
      .then(component => {
        if (cleanedUp) {
          return
        }
        setComponent(() => component)
      })
      .catch(e => {
        console.info(e)
        if (cleanedUp) {
          return
        }
        setComponent(null)
        if (e.message.startsWith('Cannot find module')) {
          if (typeof props.onNotFound === 'function') {
            props.onNotFound()
          }
        }
      })
    return () => {
      setComponent(null)
      cleanedUp = true
    }
  }, [props])

  return Component
    ? React.createElement(Component, props)
    : props.loading || 'Loading..'
}

export default function DynamicRoute(props) {
  return (
    <BrowserRouter>
      <Route
        path="/"
        render={({ history, location }) => {
          const module =
            typeof props.loader === 'function'
              ? props.loader(location.pathname)
              : import('./pages' + location.pathname).then(
                  module => module.default,
                )
          const loading = props.loading || 'Loading ' + location.pathname
          return (
            <AsyncComponent
              module={module}
              loading={loading}
              onNotFound={() => {
                history.push('/404')
              }}
              {...props}
            />
          )
        }}
      />
    </BrowserRouter>
  )
}
