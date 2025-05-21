'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApplicationApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Компонент для отображения тарифных планов
export function TariffPlans() {
  const [selectedTariff, setSelectedTariff] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const tariffs = [
    {
      id: 1,
      name: 'Стандарт',
      description: 'Стандартный тарифный план с первоначальным взносом 20%',
      initialPaymentPercent: 20,
      monthlyPaymentPercent: 0.5,
      maxTermMonths: 180,
      accelerationCoefficient: 0.01,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Оптимальный',
      description: 'Оптимальный тарифный план с первоначальным взносом 30%',
      initialPaymentPercent: 30,
      monthlyPaymentPercent: 0.7,
      maxTermMonths: 120,
      accelerationCoefficient: 0.015,
      color: 'green'
    },
    {
      id: 3,
      name: 'Ускоренный',
      description: 'Ускоренный тарифный план с первоначальным взносом 50%',
      initialPaymentPercent: 50,
      monthlyPaymentPercent: 1.0,
      maxTermMonths: 60,
      accelerationCoefficient: 0.02,
      color: 'purple'
    }
  ];

  const handleSelectTariff = (tariffId: number) => {
    setSelectedTariff(tariffId);
  };

  const handleApplyForMembership = async () => {
    if (!selectedTariff) {
      setError('Пожалуйста, выберите тарифный план');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/member/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tariff_id: selectedTariff }),
      });

      const data: ApplicationApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при подаче заявки');
      }

      setSuccess('Заявка на вступление в ЖНК успешно подана. После проверки данных вы станете пайщиком.');
      
      // Перенаправление на страницу дашборда через 3 секунды
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Тарифные планы ЖНК "Артель"</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tariffs.map((tariff) => (
          <div 
            key={tariff.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              selectedTariff === tariff.id 
                ? `border-${tariff.color}-500 bg-${tariff.color}-50 shadow-md` 
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
            onClick={() => handleSelectTariff(tariff.id)}
          >
            <div className={`text-${tariff.color}-600 font-bold text-xl mb-2`}>{tariff.name}</div>
            <p className="text-gray-600 mb-4">{tariff.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Первоначальный взнос:</span>
                <span className="font-medium">{tariff.initialPaymentPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ежемесячный платеж:</span>
                <span className="font-medium">{tariff.monthlyPaymentPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Макс. срок рассрочки:</span>
                <span className="font-medium">{tariff.maxTermMonths} мес.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Коэф. ускорения:</span>
                <span className="font-medium">{tariff.accelerationCoefficient}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className={`flex items-center ${
                selectedTariff === tariff.id ? 'visible' : 'invisible'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-${tariff.color}-500 mr-2`}></div>
                <span className={`text-${tariff.color}-600 font-medium`}>Выбран</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleApplyForMembership}
          disabled={!selectedTariff || loading}
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Отправка заявки...' : 'Подать заявку на вступление'}
        </button>
      </div>
    </div>
  );
}

// Компонент для управления документами
export function DocumentManagement() {
  const [documents, setDocuments] = useState([
    { id: 1, title: 'Заявление на вступление', status: 'Подписан', date: '2025-04-15', type: 'application' },
    { id: 2, title: 'Договор о членстве', status: 'Ожидает подписания', date: '2025-04-15', type: 'contract' },
    { id: 3, title: 'Свидетельство пайщика', status: 'Не сформирован', date: '-', type: 'certificate' }
  ]);
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Подписан':
        return 'bg-green-100 text-green-800';
      case 'Ожидает подписания':
        return 'bg-yellow-100 text-yellow-800';
      case 'Не сформирован':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'contract':
        return '📄';
      case 'certificate':
        return '🏆';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Управление документами</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Документ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-xl mr-3">{getDocumentIcon(doc.type)}</div>
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {doc.status === 'Ожидает подписания' && (
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      Подписать
                    </button>
                  )}
                  {doc.status !== 'Не сформирован' && (
                    <button className="text-gray-600 hover:text-gray-900">
                      Просмотреть
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Компонент для отображения дорожной карты накопления
export function RoadmapVisualization() {
  // Данные для дорожной карты (пример)
  const roadmapData = {
    targetAmount: 3000000, // Целевая сумма (стоимость недвижимости)
    initialPaymentPercent: 30, // Процент первоначального взноса
    initialPaymentAmount: 900000, // Сумма первоначального взноса
    currentAmount: 450000, // Текущая накопленная сумма
    monthlyPayment: 30000, // Ежемесячный платеж
    estimatedQueueDate: '2025-10-15', // Предполагаемая дата постановки в очередь
    estimatedAcquisitionDate: '2026-04-20', // Предполагаемая дата получения недвижимости
    accelerationPoint: 15, // Количество новых пайщиков для ускорения
    milestones: [
      { percent: 0, label: 'Начало', reached: true },
      { percent: 15, label: '15%', reached: true },
      { percent: 30, label: 'Постановка в очередь', reached: false },
      { percent: 50, label: '50%', reached: false },
      { percent: 75, label: '75%', reached: false },
      { percent: 100, label: 'Получение недвижимости', reached: false }
    ]
  };

  // Расчет процента выполнения
  const progressPercent = Math.round((roadmapData.currentAmount / roadmapData.initialPaymentAmount) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Дорожная карта накопления</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Ключевые показатели</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Прогресс накопления первоначального взноса</span>
                <span className="text-blue-600 font-medium">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Стоимость недвижимости:</p>
                <p className="font-medium">{roadmapData.targetAmount.toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-gray-600">Первоначальный взнос ({roadmapData.initialPaymentPercent}%):</p>
                <p className="font-medium">{roadmapData.initialPaymentAmount.toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-gray-600">Накоплено:</p>
                <p className="font-medium">{roadmapData.currentAmount.toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-gray-600">Осталось накопить:</p>
                <p className="font-medium">{(roadmapData.initialPaymentAmount - roadmapData.currentAmount).toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-gray-600">Ежемесячный платеж:</p>
                <p className="font-medium">{roadmapData.monthlyPayment.toLocaleString()} ₽</p>
              </div>
              <div>
                <p className="text-gray-600">Точка ускорения:</p>
                <p className="font-medium">{roadmapData.accelerationPoint} новых пайщиков</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Ключевые даты</h3>
          
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {roadmapData.milestones.map((milestone, index) => (
                <div key={index} className="relative pl-10 pb-6">
                  <div className={`absolute left-0 w-6 h-6 rounded-full ${
                    milestone.reached ? 'bg-green-500' : 'bg-gray-300'
                  } flex items-center justify-center`}>
                    {milestone.reached && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-md font-medium">{milestone.label}</h4>
                    {milestone.label === 'Постановка в очередь' && (
                      <p className="text-sm text-gray-500">Ожидается {roadmapData.estimatedQueueDate}</p>
                    )}
                    {milestone.label === 'Получение недвижимости' && (
                      <p className="text-sm text-gray-500">Ожидается {roadmapData.estimatedAcquisitionDate}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Рекомендации по ускорению</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Увеличьте ежемесячный платеж для более быстрого накопления</li>
          <li>Пригласите новых пайщиков для достижения точки ускорения</li>
          <li>Рассмотрите возможность внесения дополнительных взносов</li>
        </ul>
      </div>
    </div>
  );
}

// Компонент для отображения информации о токенах
export function TokensInfo() {
  // Данные о токенах (пример)
  const tokensData = {
    totalTokens: 45,
    tokenPrice: 100000,
    tokenTypes: [
      { type: 'МК-Н', count: 30, value: 3000000 },
      { type: 'МК-Ж', count: 10, value: 1000000 },
      { type: 'МК-Р', count: 5, value: 500000 }
    ],
    transactions: [
      { id: 1, date: '2025-04-10', type: 'Выпуск', tokenType: 'МК-Н', amount: 10, value: 1000000 },
      { id: 2, date: '2025-04-15', type: 'Выпуск', tokenType: 'МК-Н', amount: 20, value: 2000000 },
      { id: 3, date: '2025-04-20', type: 'Выпуск', tokenType: 'МК-Ж', amount: 10, value: 1000000 },
      { id: 4, date: '2025-04-25', type: 'Выпуск', tokenType: 'МК-Р', amount: 5, value: 500000 }
    ]
  };
  
  const getTokenTypeColor = (type: string) => {
    switch (type) {
      case 'МК-Н':
        return 'bg-blue-100 text-blue-800';
      case 'МК-Ж':
        return 'bg-green-100 text-green-800';
      case 'МК-Р':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Информация о токенах</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tokensData.tokenTypes.map((tokenType, index) => (
          <div key={index} className="border rounded-lg p-6">
            <div className={`inline-block px-2 py-1 rounded-full text-sm font-semibold mb-4 ${getTokenTypeColor(tokenType.type)}`}>
              {tokenType.type}
            </div>
            <div className="text-2xl font-bold mb-2">{tokenType.count} токенов</div>
            <div className="text-gray-600">{tokenType.value.toLocaleString()} ₽</div>
          </div>
        ))}
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Информация о стоимости</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Текущая стоимость токена:</p>
              <p className="font-medium">{tokensData.tokenPrice.toLocaleString()} ₽</p>
            </div>
            <div>
              <p className="text-gray-600">Общая стоимость токенов:</p>
              <p className="font-medium">{(tokensData.totalTokens * tokensData.tokenPrice).toLocaleString()} ₽</p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">История транзакций</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип операции
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип токена
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokensData.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTokenTypeColor(tx.tokenType)}`}>
                      {tx.tokenType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.value.toLocaleString()} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
