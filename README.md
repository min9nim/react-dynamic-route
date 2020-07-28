## react-dynamic-route

Load page component at `/src/pages` folder based on `window.location.pathname`

<br>

### Install
```
yarn add react-router-dom react-dynamic-route
```

<br>

### Basic Usage
App.js
```jsx
import React from 'react'
import DynamicRoute from 'react-dynamic-route'

export default function App() {
  return (
      <DynamicRoute
        page={path => import('./pages' + path).then(module => module.default)}
        loading={<div>Loading..</div>}
        props={{
          someProp1,
          someProp2,  // `someProp1` and `someProp2` are transfered to `module.dedault` above finally
        }}
      />  
  )
}
```

Folder structure
```
src/
  pages/
    login/
      sign-in.js
      sing-up.js
    my-info.js
    404.js
  App.js
```

Then, routed like below automatically

| path           | component                   |
| -------------- | --------------------------- |
| /login/sign-in | /src/pages/login/sign-in.js |
| /login/sign-up | /src/pages/login/sign-up.js |
| /my-info       | /src/pages/my-info.js       |
| /blablabla     | /src/pages/404.js           |
