import React from 'react'
// It defines a React component named Layout that:
//     Takes one prop called children
//     Ensures that children must be a valid React element or elements (JSX)
const Layout = ({children}:{children: React.ReactNode}) => {
  return (
    <main className='root'>
        <div className='root-container'>
            <div className='wrapper'>{children}</div>
        </div>
    </main>
  )
}

export default Layout
