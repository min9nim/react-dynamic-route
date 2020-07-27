## react-dynamic-route

Load page component at `/src/pages` folder based on `window.location.pathname`

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
        loading={<Loading />}
        props={{
          someProp1,
          someProp2,
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

Then, routes below

| path           | component                   |
| -------------- | --------------------------- |
| /login/sign-in | /src/pages/login/sign-in.js |
| /login/sign-up | /src/pages/login/sign-up.js |
| /my-info       | /src/pages/my-info.js       |
| /blablabla     | /src/pages/404.js           |
