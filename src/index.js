import React, { useEffect, useState } from 'react'
import { Route } from 'react-router-dom'

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
          props.onError(e, props.history)
          return
        }
        throw e
      })
    return () => {
      setComponent(null)
      cleanedUp = true
    }
  }, [props.path])

  return Component
    ? React.createElement(Component, props.otherProps)
    : props.loading
}

export default function DynamicRoute(props) {
  return (
    <Route
      path="/"
      render={({ history }) => (
        <AsyncComponent
          path={window.location.pathname}
          component={props.page(window.location.pathname)}
          loading={props.loading || 'Loading..'}
          onError={props.onError}
          otherProps={props.props}
          history={history}
        />
      )}
    />
  )
}
