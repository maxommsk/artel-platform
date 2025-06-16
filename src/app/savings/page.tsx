import CrossLinks from '@/components/CrossLinks'

export default function SavingsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Накопления</h1>
      <p className="mb-2">Здесь описан принцип накопления в токенах "Метр Кубический".</p>
      <p className="mb-2">Планируется калькулятор взносов и сравнение с обычными деньгами.</p>
      <CrossLinks />
    </main>
  )
}
