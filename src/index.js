import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

export function AsyncComponent(props) {
  const [Component, setComponent] = useState(null)

  useEffect(() => {
    let cleanedUp = false
    props.component
      .then(component => {
        if (cleanedUp) {
          return
        }
        setComponent(() => component)
      })
      .catch(e => {
        if (!cleanedUp) {
          setComponent(null)
        }
        if (typeof props.onError === 'function') {
          props.onError(e)
          return
        }
        throw e
      })
    return () => {
      setComponent(null)
      cleanedUp = true
    }
  }, [props])

  return Component
    ? React.createElement(Component, props.otherProps)
    : props.loading
}

export default function DynamicRoute(props) {
  return (
    <BrowserRouter>
      <Route
        path="/"
        render={({ history }) => {
          // console.info('Dynamic Route:  window.location.pathname = ' + window.location.pathname)
          // console.info('Dynamic Route:  location.pathname = ' + location.pathname)
          const onError = e => {
            if (e.message.startsWith('Cannot find module') && window.location.pathname !== '/404') {
              history.push('/404')
              return
            }
            throw e
          }

          return (
            <AsyncComponent
              component={props.page(window.location.pathname)}
              loading={props.loading || 'Loading..'}
              onError={props.onError || onError}
              otherProps={props.props}
            />
          )
        }}
      />
    </BrowserRouter>
  )
}
