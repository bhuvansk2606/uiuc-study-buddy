// components/Navbar.tsx
'use client'

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const handleProtectedNavigation = (path: string) => {
    if (status === 'authenticated') {
      router.push(path)
    } else {
      // Store the intended destination in sessionStorage
      sessionStorage.setItem('intendedDestination', path)
      signIn('google', { callbackUrl: path })
    }
  }

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Courses', href: '/courses', current: pathname === '/courses' },
    { name: 'Matches', href: '/matches', current: pathname === '/matches' },
  ]

  return (
    <Disclosure as="nav" className="bg-[#13294B]">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent select-none">
                    UIUSync
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleProtectedNavigation(item.href)}
                      className={classNames(
                        item.current
                          ? 'border-[#E84A27] text-white'
                          : 'border-transparent text-gray-300 hover:border-[#E84A27] hover:text-white',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {status === 'authenticated' ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-[#E84A27] text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#13294B]">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 flex items-center justify-center text-white">
                            {session.user.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-sm text-gray-700">
                          {session.user.name}
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut({ callbackUrl: '/' })}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full px-4 py-2 text-left text-sm text-gray-700'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={() => handleProtectedNavigation('/courses')}
                    className="rounded-md bg-[#E84A27] px-3 py-2 text-sm font-medium text-white hover:bg-[#D73D1C]"
                  >
                    {pathname === '/' ? 'Get Started' : 'Sign in'}
                  </button>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-[#1A3A5F] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="button"
                  onClick={() => handleProtectedNavigation(item.href)}
                  className={classNames(
                    item.current
                      ? 'border-[#E84A27] bg-[#1A3A5F] text-white'
                      : 'border-transparent text-gray-300 hover:border-[#E84A27] hover:bg-[#1A3A5F] hover:text-white',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium w-full text-left'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-[#1A3A5F] pb-3 pt-4">
              {status === 'authenticated' ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-base font-medium text-gray-300">
                    {session.user.name}
                  </div>
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-gray-300 hover:bg-[#1A3A5F] hover:text-white"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Disclosure.Button
                    as="button"
                    onClick={() => handleProtectedNavigation('/courses')}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-gray-300 hover:bg-[#1A3A5F] hover:text-white"
                  >
                    {pathname === '/' ? 'Get Started' : 'Sign in'}
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
