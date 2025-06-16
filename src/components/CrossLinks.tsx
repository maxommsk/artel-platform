'use client'

import Link from 'next/link'

export default function CrossLinks() {
  return (
    <div className="mt-8 space-x-4">
      <Link href="/real-estate" className="text-blue-600 hover:underline">Недвижимость</Link>
      <Link href="/savings" className="text-blue-600 hover:underline">Накопления</Link>
      <Link href="/arrangement" className="text-blue-600 hover:underline">Обустройство</Link>
      <Link href="/how-to-join" className="text-blue-600 hover:underline">Как вступить</Link>
    </div>
  )
}
