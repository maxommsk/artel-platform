-- Миграция для добавления иерархической структуры ветвей пайщиков

-- Таблица ветвей (иерархическая структура)
CREATE TABLE IF NOT EXISTS Branches (
    BranchID INTEGER PRIMARY KEY AUTOINCREMENT,
    BranchName TEXT NOT NULL, -- Например, "1.1", "1.2.1"
    ParentBranchID INTEGER, -- NULL для корневой(ых) ветви(ей)
    MemberCount INTEGER DEFAULT 0 NOT NULL, -- Текущее количество активных пайщиков в ветви
    MaxCapacity INTEGER DEFAULT 5000 NOT NULL, -- Максимальная вместимость ветви до разделения
    IsActiveForNewMembers BOOLEAN DEFAULT TRUE NOT NULL, -- Может ли ветвь принимать новых пайщиков
    DepthLevel INTEGER NOT NULL, -- Уровень вложенности в иерархии (0 для корневых)
    CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (ParentBranchID) REFERENCES Branches(BranchID) ON DELETE SET NULL -- или ON DELETE CASCADE в зависимости от логики
);

-- Добавление поля для связи пайщика с его текущей ветвью
ALTER TABLE members ADD COLUMN CurrentBranchID INTEGER;

-- Обновление таблицы members для добавления внешнего ключа CurrentBranchID
-- Это может потребовать временного отключения внешних ключей, если SQLite это требует при ALTER TABLE
-- PRAGMA foreign_keys=off;
-- ALTER TABLE members ADD COLUMN CurrentBranchID INTEGER REFERENCES Branches(BranchID) ON DELETE SET NULL;
-- PRAGMA foreign_keys=on;
-- Однако, более безопасный способ в SQLite - создать новую таблицу и скопировать данные.
-- Но для простоты миграции, если пайщики еще не привязаны к ветвям, можно просто добавить колонку,
-- а затем отдельно обновить ее или установить внешний ключ позже, когда данные будут консистентны.
-- Для новой колонки пока не будем строго устанавливать FOREIGN KEY constraint через ALTER TABLE,
-- так как это может вызвать проблемы в SQLite с существующими данными или потребовать более сложных миграций.
-- Связь будет поддерживаться на уровне приложения, а позже можно будет усилить на уровне БД.

-- Индексы для таблицы Branches
CREATE INDEX IF NOT EXISTS idx_branches_parent_branch_id ON Branches (ParentBranchID);
CREATE INDEX IF NOT EXISTS idx_branches_is_active_depth ON Branches (IsActiveForNewMembers, DepthLevel, MemberCount);

-- Индекс для поля CurrentBranchID в таблице members
CREATE INDEX IF NOT EXISTS idx_members_current_branch_id ON members (CurrentBranchID);

-- Начальная настройка для системы ветвления
-- Можно добавить корневую ветвь, если это требуется при инициализации системы.
INSERT OR IGNORE INTO Branches (BranchName, ParentBranchID, MemberCount, MaxCapacity, IsActiveForNewMembers, DepthLevel) VALUES
('Root', NULL, 0, 5000, TRUE, 0);

-- Добавление настройки в таблицу settings для отслеживания статуса инициализации ветвления
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
('branching_system_initialized', 'false', 'Статус инициализации системы иерархического ветвления пайщиков (true/false)');

-- Удаление старой колонки division_group из таблицы members, так как новая система ветвления ее заменяет
-- Проверить, существует ли колонка перед удалением, чтобы избежать ошибки, если миграция применяется повторно или колонка уже удалена
-- К сожалению, SQLite не имеет простого IF EXISTS для DROP COLUMN в ALTER TABLE.
-- Этот шаг лучше выполнять с осторожностью и, возможно, вручную или через более сложный скрипт,
-- проверяющий схему. Для данной миграции мы его закомментируем, предполагая, что это будет обработано отдельно, если необходимо.
-- ALTER TABLE members DROP COLUMN division_group;

