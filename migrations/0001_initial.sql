-- Миграция для создания базы данных ЖНК "Артель"

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE, -- Используется для входа, может быть email или телефон
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    middle_name TEXT,
    language TEXT DEFAULT 'ru', -- Язык интерфейса пользователя (ru/en)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- 'guest', 'member', 'manager', 'admin'
    description TEXT
);

-- Таблица связи пользователей и ролей (многие ко многим)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Таблица тарифных планов
CREATE TABLE IF NOT EXISTS tariffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    initial_payment_percent REAL NOT NULL, -- процент первоначального взноса
    max_term_months INTEGER NOT NULL, -- максимальный срок рассрочки в месяцах
    acceleration_coefficient REAL NOT NULL, -- коэффициент ускорения
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пайщиков (соответствует 'pledges' в ТЗ)
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    passport_series TEXT,
    passport_number TEXT,
    passport_issued_by TEXT,
    passport_issue_date DATE,
    registration_address TEXT,
    actual_address TEXT,
    tariff_id INTEGER,
    membership_status TEXT NOT NULL, -- статус членства (заявка, активный, приостановлен, исключен)
    queue_position INTEGER, -- позиция в очереди
    queue_date DATE, -- дата постановки в очередь
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tariff_id) REFERENCES tariffs(id) ON DELETE SET NULL
);

-- Таблица недвижимости
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    type TEXT NOT NULL, -- тип недвижимости (квартира, дом, комната)
    area REAL NOT NULL, -- площадь в м²
    rooms INTEGER, -- количество комнат
    floor INTEGER, -- этаж
    total_floors INTEGER, -- всего этажей в здании
    price REAL NOT NULL, -- стоимость
    status TEXT NOT NULL, -- статус (доступна, зарезервирована, приобретена)
    rating TEXT, -- рейтинг объекта (A+, A, B+, B, C+, C, D)
    rating_coefficient REAL, -- коэффициент влияния рейтинга на стоимость токенов
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица паевых взносов (соответствует 'payments' в ТЗ)
CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL, -- сумма взноса
    contribution_type TEXT NOT NULL, -- тип взноса (первоначальный, ежемесячный, дополнительный)
    payment_method TEXT NOT NULL, -- способ оплаты
    transaction_id TEXT, -- идентификатор транзакции в платежной системе
    status TEXT NOT NULL, -- статус платежа (обработан, в обработке, отклонен)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Таблица документов
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER, -- Может быть NULL для общих документов ЖНК
    user_id INTEGER, -- Для документов, связанных с пользователем до вступления
    document_type TEXT NOT NULL, -- тип документа (заявление, договор, свидетельство, устав, регламент)
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT, -- путь к файлу в централизованном хранилище (если используется)
    ipfs_hash TEXT, -- хеш документа в IPFS
    blockchain_hash TEXT, -- хеш записи в блокчейне (для подтверждения подлинности/подписи)
    status TEXT NOT NULL, -- статус документа (черновик, ожидает подписи, подписан, архивный)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица токенов
CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    token_type TEXT NOT NULL, -- тип токена (МК-Н, МК-Ж, МК-Р)
    amount REAL NOT NULL, -- количество токенов
    price_per_token REAL NOT NULL, -- цена за один токен при выпуске
    property_id INTEGER, -- связь с объектом недвижимости (для МК-Ж)
    blockchain_id TEXT, -- идентификатор токена в блокчейне
    status TEXT NOT NULL, -- статус (активен, погашен)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Таблица транзакций с токенами
CREATE TABLE IF NOT EXISTS token_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- тип транзакции (выпуск, передача, погашение)
    amount REAL NOT NULL, -- количество токенов
    from_member_id INTEGER, -- отправитель (NULL для выпуска)
    to_member_id INTEGER, -- получатель (NULL для погашения)
    blockchain_tx_id TEXT, -- идентификатор транзакции в блокчейне
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE,
    FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Таблица для хранения расчетов калькулятора точки ускорения
CREATE TABLE IF NOT EXISTS acceleration_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Расчет может делать и не пайщик
    tariff_id INTEGER NOT NULL,
    property_price REAL NOT NULL,
    initial_payment_amount REAL NOT NULL,
    monthly_payment_amount REAL NOT NULL,
    base_term_months INTEGER NOT NULL, -- базовый срок ожидания
    new_members_count INTEGER NOT NULL, -- количество новых пайщиков
    accelerated_term_months INTEGER NOT NULL, -- ускоренный срок ожидания
    saved_months INTEGER NOT NULL, -- сэкономленные месяцы
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tariff_id) REFERENCES tariffs(id) ON DELETE CASCADE
);

-- Таблица сообщений (новая, согласно ТЗ)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица для хранения настроек системы
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных данных

-- Роли пользователей (Обновлено согласно ТЗ: Гость, Пайщик, Администратор. Оставляем Менеджера для внутренних нужд)
INSERT OR IGNORE INTO roles (name, description) VALUES 
('guest', 'Гость (неавторизованный или базовый пользователь)'),
('member', 'Пайщик ЖНК'),
('manager', 'Менеджер ЖНК (внутренняя роль для управления)'),
('admin', 'Администратор системы с полным доступом');

-- Тарифные планы (Убрано monthly_payment_percent, т.к. оно неявно определяется сроком и суммой)
INSERT OR IGNORE INTO tariffs (name, description, initial_payment_percent, max_term_months, acceleration_coefficient, is_active) VALUES 
('Стандарт', 'Стандартный тарифный план с первоначальным взносом 20%', 20.0, 180, 0.01, TRUE),
('Оптимальный', 'Оптимальный тарифный план с первоначальным взносом 30%', 30.0, 120, 0.015, TRUE),
('Ускоренный', 'Ускоренный тарифный план с первоначальным взносом 50%', 50.0, 60, 0.02, TRUE);

-- Настройки системы
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
('token_base_price', '100000', 'Базовая стоимость токена МК-Н в рублях за 1 м²'),
('min_contribution_amount', '5000', 'Минимальная сумма взноса в рублях'),
('queue_algorithm', 'standard', 'Алгоритм формирования очереди (standard, priority, mixed)'),
('blockchain_network', 'masterchain', 'Используемая блокчейн-сеть для токенизации'),
('default_language', 'ru', 'Язык по умолчанию для новых пользователей');

-- Добавляем индекс для ускорения поиска сообщений
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);

