import CrossLinks from '@/components/CrossLinks'

export default function NewsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Новости</h1>
      <p>Последние решения собраний и новости кооператива.</p>
      <CrossLinks />
    </main>
  )
}
