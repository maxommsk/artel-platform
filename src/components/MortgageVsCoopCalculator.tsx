'use client'

import React, { useState } from 'react'

export default function MortgageVsCoopCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(5000000)
  const [mortgageRate, setMortgageRate] = useState(14)
  const [termYears, setTermYears] = useState(20)
  const [monthlyContribution, setMonthlyContribution] = useState(40000)
  const [showResult, setShowResult] = useState(false)

  const calculateMortgage = () => {
    const P = propertyPrice
    const r = mortgageRate / 100 / 12
    const n = termYears * 12
    const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const total = monthly * n
    return { monthly: Math.round(monthly), overpayment: Math.round(total - P), total: Math.round(total) }
  }

  const calculateCoop = () => {
    const months = propertyPrice / monthlyContribution
    return { months: Math.ceil(months) }
  }

  const mortgage = calculateMortgage()
  const coop = calculateCoop()
  const savings = mortgage.overpayment

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResult(true)
  }

  const barHeight = (value: number) => `${Math.min(100, value / propertyPrice * 100)}%`

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-center">Ипотека vs ЖНК</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Стоимость жилья (₽)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ставка по ипотеке (%)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={mortgageRate}
            onChange={(e) => setMortgageRate(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Срок кредита (лет)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ежемесячный взнос в ЖНК (₽)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2 text-center">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Рассчитать</button>
        </div>
      </form>

      {showResult && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-bold mb-2">🏦 Ипотека</h4>
              <p>Ежемесячный платёж: {mortgage.monthly.toLocaleString()} ₽</p>
              <p>Общая переплата: {mortgage.overpayment.toLocaleString()} ₽</p>
              <p>Итоговая сумма: {mortgage.total.toLocaleString()} ₽</p>
              <p>Дом в собственности через: {termYears} лет</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h4 className="font-bold mb-2">🛠 ЖНК</h4>
              <p>Накопление по {monthlyContribution.toLocaleString()} ₽ в мес: {coop.months} месяцев</p>
              <p>Переплата: 0 ₽</p>
              <p>Возможность досрочного распределения: да</p>
              <p>Участие в управлении: да</p>
            </div>
          </div>
          <div className="flex items-end justify-center gap-8 h-32">
            <div className="flex flex-col justify-end items-center h-full">
              <div className="bg-blue-500 w-12" style={{ height: barHeight(mortgage.overpayment) }}></div>
              <span className="mt-2 text-sm">Переплата</span>
            </div>
            <div className="flex flex-col justify-end items-center h-full">
              <div className="bg-green-500 w-12" style={{ height: '2px' }}></div>
              <span className="mt-2 text-sm">Нет переплаты</span>
            </div>
          </div>
          <p className="text-center mt-4 font-semibold">Вы экономите {savings.toLocaleString()} ₽ и избегаете {termYears} лет долгов!</p>
        </div>
      )}
    </div>
  )
}
