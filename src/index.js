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
          console.info('Dynamic Route: ' + location.pathname)
          const loading = props.loading || 'Loading ' + location.pathname
          return (
            <AsyncComponent
              component={props.loader(location.pathname)}
              loading={loading}
              onError={props.onError}
              {...props.otherProps}
            />
          )
        }}
      />
    </BrowserRouter>
  )
}
