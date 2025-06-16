'use client'

import React from 'react'
import Link from 'next/link'
import CrossLinks from '@/components/CrossLinks'
import MortgageVsCoopCalculator from '@/components/MortgageVsCoopCalculator'

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      
      {/* Главный баннер */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Жилищно-накопительный кооператив "Артель"</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Инновационный подход к приобретению жилья с использованием цифровых финансовых активов и децентрализованных технологий
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-6 py-3 rounded-md bg-white text-blue-600 font-bold hover:bg-blue-50 transition">
              Стать пайщиком
            </Link>
            <Link href="#calculator" className="px-6 py-3 rounded-md border border-white text-white font-bold hover:bg-blue-700 transition">
              Рассчитать выгоду
            </Link>
          </div>
        </div>
      </div>
      
      {/* Преимущества */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Преимущества ЖНК "Артель"</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="text-4xl text-blue-500 mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-3">Гибкие тарифные планы</h3>
              <p className="text-gray-600">
                Выберите оптимальный тарифный план с первоначальным взносом от 20% до 50% и сроком рассрочки до 15 лет.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="text-4xl text-blue-500 mb-4">🔄</div>
              <h3 className="text-xl font-bold mb-3">Точка ускорения</h3>
              <p className="text-gray-600">
                Уникальный механизм, позволяющий сократить срок ожидания жилья при вступлении новых пайщиков.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="text-4xl text-blue-500 mb-4">🪙</div>
              <h3 className="text-xl font-bold mb-3">Токенизация взносов</h3>
              <p className="text-gray-600">
                Паевые взносы конвертируются в цифровые финансовые активы "Метр Кубический", защищая от инфляции.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Тарифные планы */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Тарифные планы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-400">
              <h3 className="text-xl font-bold text-blue-600 mb-4">Стандарт</h3>
              <div className="text-3xl font-bold mb-6">20% <span className="text-lg text-gray-500 font-normal">первоначальный взнос</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Срок рассрочки до 15 лет</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ежемесячный платеж 0.5%</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Коэффициент ускорения 0.01</span>
                </li>
              </ul>
              
              <Link href="/register" className="block text-center py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                Выбрать план
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-400 transform scale-105">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                Популярный
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-4">Оптимальный</h3>
              <div className="text-3xl font-bold mb-6">30% <span className="text-lg text-gray-500 font-normal">первоначальный взнос</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Срок рассрочки до 10 лет</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ежемесячный платеж 0.7%</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Коэффициент ускорения 0.015</span>
                </li>
              </ul>
              
              <Link href="/register" className="block text-center py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                Выбрать план
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-400">
              <h3 className="text-xl font-bold text-purple-600 mb-4">Ускоренный</h3>
              <div className="text-3xl font-bold mb-6">50% <span className="text-lg text-gray-500 font-normal">первоначальный взнос</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Срок рассрочки до 5 лет</span>
                </li>
                <li className="flex items-start">
                                     <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Ежемесячный платеж 1.0%</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Коэффициент ускорения 0.02</span>
                </li>
              </ul>
              
              <Link href="/register" className="block text-center py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition">
                Выбрать план
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Калькулятор */}
      <div id="calculator" className="py-16 bg-white">
        <div className="container mx-auto px-4">
                   <MortgageVsCoopCalculator />

        </div>
      </div>
      
      {/* Токенизация */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Токенизация паевых взносов</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Цифровой финансовый актив "Метр Кубический"</h3>
              <p className="text-gray-600 mb-6">
                ЖНК "Артель" использует инновационную систему токенизации паевых взносов через цифровой финансовый актив "Метр Кубический".
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold">Защита от инфляции</h4>

                    <p className="text-gray-600">Стоимость токена привязана к рыночной стоимости 1 м² жилья в регионе.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold">Прозрачность и безопасность</h4>
                    <p className="text-gray-600">Все операции с токенами записываются в блокчейн и доступны для проверки.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold">Ликвидность</h4>
                    <p className="text-gray-600">Возможность передачи токенов между пайщиками и конвертации в фиатные деньги.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6">Типы токенов</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-bold text-blue-600">МК-Н (токены накопления)</h4>
                  <p className="text-gray-600">Используются на этапе накопления паевого взноса. Каждый токен эквивалентен 1 м² жилья по текущей рыночной стоимости.</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-bold text-green-600">МК-Ж (токены недвижимости)</h4>
                  <p className="text-gray-600">Привязаны к конкретным объектам недвижимости на балансе кооператива. Обеспечены реальными активами.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-bold text-purple-600">МК-Р (токены резервного фонда)</h4>
                  <p className="text-gray-600">Обеспечивают защиту от рисков и стабильность системы. Часть взносов конвертируется в эти токены.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Децентрализация */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Децентрализация данных</h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-8 text-center">
              ЖНК "Артель" использует передовые технологии децентрализации для обеспечения безопасности и прозрачности данных.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Блокчейн</h3>
                <p className="text-blue-100">
                  Все операции с токенами и ключевые события записываются в блокчейн, обеспечивая неизменность и прозрачность данных.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">IPFS</h3>
                <p className="text-blue-100">
                  Документы хранятся в децентрализованной файловой системе IPFS, что гарантирует их сохранность и доступность.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
             
                <h3 className="text-xl font-bold mb-3">Смарт-контракты</h3>
                <p className="text-blue-100">
                  Автоматическое исполнение обязательств через смарт-контракты обеспечивает надежность и исключает человеческий фактор.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Призыв к действию */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы стать пайщиком ЖНК "Артель"?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Присоединяйтесь к инновационному жилищно-накопительному кооперативу и приобретайте жилье на выгодных условиях с использованием современных технологий.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-3 rounded-md bg-blue-500 text-white font-bold hover:bg-blue-600 transition">
              Зарегистрироваться
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-md border border-blue-500 text-blue-500 font-bold hover:bg-blue-50 transition">
              Войти в личный кабинет
            </Link>
          </div>
      </div>
    </div>

      <div className="container mx-auto px-4">
        <CrossLinks />
      </div>

      {/* Подвал */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ЖНК "Артель"</h3>
              <p className="text-gray-400">
                Инновационный жилищно-накопительный кооператив с использованием цифровых финансовых активов и децентрализованных технологий.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Навигация</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition">Главная</Link></li>
                <li><Link href="#calculator" className="text-gray-400 hover:text-white transition">Калькулятор</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition">Личный кабинет</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white transition">Регистрация</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Документы</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Устав кооператива</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Правила членства</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Политика конфиденциальности</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition">Пользовательское соглашение</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Контакты</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-gray-400">+7 (XXX) XXX-XX-XX</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-400">info@znk-artel.ru</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-gray-400">г. Москва, ул. Примерная, д. 123</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ЖНК "Артель". Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
