import CrossLinks from '@/components/CrossLinks'
import AccumulationCalculator from '@/components/AccumulationCalculator'

export default function SavingsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Накопления</h1>
      <p className="mb-2">Здесь описан принцип накопления в токенах "Метр Кубический".</p>
      <div className="my-8">
        <AccumulationCalculator />
      </div>
      <CrossLinks />
    </main>
  )
}
