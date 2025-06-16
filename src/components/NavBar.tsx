'use client'

import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 mr-4">
          ЖНК "Артель"
        </Link>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/real-estate" className="hover:underline">Недвижимость</Link>
          <Link href="/savings" className="hover:underline">Накопления</Link>
          <Link href="/arrangement" className="hover:underline">Обустройство</Link>
          <Link href="/how-to-join" className="hover:underline">Как вступить</Link>
          <Link href="/dashboard" className="hover:underline">Личный кабинет</Link>
        </div>
      </div>
    </nav>
  )
}
