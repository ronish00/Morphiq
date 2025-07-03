import MobileNav from '@/component/shared/MobileNav'
import Sidebar from '@/component/shared/Sidebar'
import React from 'react'
// It defines a React component named Layout that:
//     Takes one prop called children
//     Ensures that children must be a valid React element or elements (JSX)  

// this is where all the pages of the application will be
const Layout = ({children}:{children: React.ReactNode}) => {
  return (
    <main className='root'>
      <Sidebar />
        {
           <MobileNav />
          

        }


        <div className='root-container'>
            <div className='wrapper'>{children}</div>
        </div>
    </main>
  )
}

export default Layout
