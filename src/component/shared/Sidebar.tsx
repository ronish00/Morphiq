"use client";
//turns server side rendered component to client side rendered component
//w/o client, our usePathname hook doesnt work
import Link from 'next/link';
import Image from 'next/image'

import React from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { navLinks } from '../../../constants';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Sidebar = () => {

    const pathname = usePathname();
    return (
        <aside className='sidebar'>
            <div className='flex justify-center items-center size-full flex-col gap-4'>
                <Link href="/" className='sidebar-logo'>
                    <Image src='/assets/images/logo-text.svg' alt='logo' width={180} height={28} />
                </Link>

                <nav className='sidebar-nav'>
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {navLinks.slice(0, 6).map((link) => {                    //this navlinks come from constants/index.ts and for each link, we open up a function block
                                const isActive = link.route === pathname //this is to check if we are currently at the link that we're trying to go. 
                                // Also, pathname comes from use pathname hook

                                return (
                                    <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-teal text-black' : 'text-gray-700'
                                        }`}>
                                        <Link className='sidebar-link' href={link.route}>
                                            <Image
                                                src={link.icon}
                                                alt='logo'
                                                width={24}
                                                height={24}
                                                className={`${isActive && 'brightness-200'}`}
                                            />
                                            {link.label}
                                        </Link>
                                    </li>
                                )

                            })}
                        </ul>
                        <ul className='sidebar-nav_elements'>
                            {navLinks.slice(6).map((link) => {                    //this navlinks come from constants/index.ts and for each link, we open up a function block
                                const isActive = link.route === pathname //this is to check if we are currently at the link that we're trying to go. 
                                // Also, pathname comes from use pathname hook

                                return (
                                    <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-teal text-black' : 'text-gray-700'
                                        }`}>
                                        <Link className='sidebar-link' href={link.route}>
                                            <Image
                                                src={link.icon}
                                                alt='logo'
                                                width={24}
                                                height={24}
                                                className={`${isActive && 'brightness-200'}`}
                                            />
                                            {link.label}
                                        </Link>
                                    </li>
                                )

                            })}
                            <li className='flex-center cursor-pointer gap-2 p-4'>
                                <UserButton />

                            </li>
                        </ul>
                    </SignedIn>
                    <SignedOut>
                        <Button asChild className='button bg-teal bg-cover'>
                            <Link href='/sign-in'>Login</Link>
                        </Button>
                    </SignedOut>
                </nav>
            </div>
        </aside>
    )
}

export default Sidebar
