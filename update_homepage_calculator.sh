#!/bin/bash

TARGET_FILE="src/app/page.tsx"

# Проверим, существует ли файл
if [ ! -f "$TARGET_FILE" ]; then
  echo "❌ Файл $TARGET_FILE не найден."
  exit 1
fi

echo "🔧 Обновляем $TARGET_FILE ..."

# Добавляем 'use client' если нет
if ! grep -q "'use client'" "$TARGET_FILE"; then
  sed -i '1s;^;'\''use client'\''\n\n;' "$TARGET_FILE"
  echo "✅ Добавлен 'use client'."
fi

# Добавляем импорт React и useState если нет
if ! grep -q "import React" "$TARGET_FILE"; then
  sed -i '/use client/a\
import React, { useState } from "react";' "$TARGET_FILE"
  echo "✅ Добавлен импорт React и useState."
fi

# Заменяем блок калькулятора новым кодом
sed -i '/Калькулятор/,/<!-- END CALCULATOR -->/c\
{/* Калькулятор */}\
<div id="calculator" className="py-16 bg-white">\
  <div className="container mx-auto px-4">\
    <h2 className="text-3xl font-bold text-center mb-12">Калькулятор точки ускорения</h2>\
\
    <div className="max-w-3xl mx-auto bg-blue-50 rounded-lg p-8">\
      <p className="text-gray-700 mb-6">\
        Рассчитайте, как вступление новых пайщиков в ЖНК \"Артель\" сократит срок ожидания вашей недвижимости.\
      </p>\
\
      <form onSubmit={handleSubmit}>\
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">\
          <div>\
            <label className="block text-gray-700 font-medium mb-2">Тарифный план</label>\
            <select\
              name="tariff_id"\
              value={formData.tariff_id}\
              onChange={handleChange}\
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\
              required\
            >\
              <option value="">Выберите тариф</option>\
              <option value="1">Стандарт (20%)</option>\
              <option value="2">Оптимальный (30%)</option>\
              <option value="3">Ускоренный (50%)</option>\
            </select>\
          </div>\
\
          <div>\
            <label className="block text-gray-700 font-medium mb-2">Стоимость недвижимости</label>\
            <input\
              type="number"\
              name="property_price"\
              value={formData.property_price}\
              onChange={handleChange}\
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\
              placeholder="3 000 000"\
              required\
            />\
          </div>\
\
          <div>\
            <label className="block text-gray-700 font-medium mb-2">Количество новых пайщиков</label>\
            <input\
              type="number"\
              name="new_members_count"\
              value={formData.new_members_count}\
              onChange={handleChange}\
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\
              placeholder="10"\
              required\
            />\
          </div>\
\
          <div className="flex items-end">\
            <button\
              type="submit"\
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"\
            >\
              Рассчитать\
            </button>\
          </div>\
        </div>\
      </form>\
\
      {result && (\
        <div className="bg-white p-4 rounded-lg border mt-6">\
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\
            <div>\
              <p className="text-gray-600">Первоначальный взнос:</p>\
              <p className="font-medium">{result.initial_payment}</p>\
            </div>\
            <div>\
              <p className="text-gray-600">Ежемесячный платёж:</p>\
              <p className="font-medium text-green-600">{result.monthly_payment}</p>\
            </div>\
          </div>\
        </div>\
      )}\
    </div>\
  </div>\
</div>' "$TARGET_FILE"

echo "✅ Калькулятор обновлён успешно."

echo "✅ Напоминаю: убедись, что у тебя есть состояния formData, result, handleChange и handleSubmit в компоненте."
