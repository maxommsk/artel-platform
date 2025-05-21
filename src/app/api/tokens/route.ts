import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getCurrentUser } from '@/lib/auth'; // Убедитесь, что getCurrentUser действительно в @/lib/auth
// import { blockchainService } from '@/lib/blockchain'; // Раскомментируйте, если используете
// ... другие импорты ...

interface CloudflareEnv {
  DB: D1Database;
  // Добавьте сюда другие переменные окружения, если они есть, например:
  // MY_KV_NAMESPACE: KVNamespace;
  // MY_BUCKET: R2Bucket;
}


// Определяем тип для одного токена (из базы данных или блокчейна)
interface TokenFromDB {
  id: number;
  member_id: number;
  token_type: string; // Это будет ключ для группировки
  value: number;        // Сумма или количество токенов этого типа
  // добавьте другие поля, если они есть в таблице member_tokens
}

// Определяем тип для токена, который может прийти из блокчейн-сервиса
// Если структура отличается от TokenFromDB, создайте отдельный интерфейс
// Например, YourBlockchainTokenType
interface YourBlockchainTokenType {
  type: string; // или token_type
  amount: number; // или value
  // ... другие поля от блокчейн-сервиса
}

// Определяем тип для объекта, в который будем суммировать токены
interface TokenSummaryAccumulator {
  [key: string]: {
    count: number;
    value: number;
  };
}

// Предполагаемый интерфейс для объекта пользователя
interface User {
  id: number;
  // ...другие поля пользователя
}

// Предполагаемый интерфейс для объекта участника (member)
interface Member {
  member_id: number;
  user_id: number;
  wallet_address: string | null;
  blockchain_address: string | null; // Добавили это поле
}

// Имитация blockchainService, если он не используется или для теста
const blockchainService = {
  getTokensByOwner: async (address: string): Promise<YourBlockchainTokenType[]> => {
    console.log(`Имитация запроса токенов для адреса: ${address}`);
    // Вернем пустой массив или тестовые данные
    // return [{ type: 'ZNK_mock', amount: 100 }]; 
    return [];
  }
};

export async function GET(request: NextRequest) {
  const env = getRequestContext().env as CloudflareEnv; 
const db: D1Database = env.DB;

  const user = await getCurrentUser(); // Убедитесь, что пользователь получается с await

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Получаем информацию об участнике, включая blockchain_address
    const { results: membersResults } = await db.prepare(
      `SELECT 
          m.id as member_id, 
          m.user_id, 
          u.wallet_address,
          u.blockchain_address
        FROM members m
         JOIN users u ON m.user_id = u.id
         WHERE m.user_id = ?`
        ).bind(user.id as number).all<Member>();

    if (!membersResults || membersResults.length === 0) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }
    const member = membersResults[0];
    const memberId = member.member_id;

    // 2. Получение токенов пайщика из базы данных (таблица member_tokens)
    const { results: dbTokens } = await db.prepare(
      `SELECT id, member_id, token_type, value FROM member_tokens WHERE member_id = ?`
    ).bind(memberId).all<TokenFromDB>();

    // 3. Если у пользователя есть blockchain_address, получаем токены из блокчейна
    let blockchainTokensApiResult: YourBlockchainTokenType[] = [];
    if (member.blockchain_address) {
      try {
        blockchainTokensApiResult = await blockchainService.getTokensByOwner(member.blockchain_address);
      } catch (error) {
        console.error('Error fetching blockchain tokens:', error);
        // Можно вернуть ошибку или продолжить с пустым массивом
      }
    }

    // Преобразуем токены из блокчейна в наш формат TokenFromDB для единообразия
    const formattedBlockchainTokens: TokenFromDB[] = blockchainTokensApiResult.map((bToken, index) => ({
      id: -(index + 1), // Временный ID для токенов из блокчейна, т.к. у них нет ID из БД
      member_id: memberId,
      token_type: bToken.type, // или bToken.token_type
      value: bToken.amount,    // или bToken.value
    }));

    // Объединяем токены из БД и блокчейна
    const allTokens: TokenFromDB[] = [...(dbTokens || []), ...formattedBlockchainTokens];

    // 4. Суммирование токенов по типам
    const tokenSummary = allTokens.reduce((summary: TokenSummaryAccumulator, token: TokenFromDB) => {
      const type = token.token_type;
      if (!summary[type]) {
        summary[type] = {
          count: 0, // Если value это количество, то count можно убрать или использовать для другого
          value: 0
        };
      }
      // summary[type].count += 1; // Если нужно считать количество записей токенов
      summary[type].value += token.value; // Суммируем значение/количество токенов
      return summary;
    }, {} as TokenSummaryAccumulator);

    return NextResponse.json({
      memberId: memberId,
      walletAddress: member.wallet_address,
      blockchainAddress: member.blockchain_address,
      dbTokensCount: dbTokens?.length || 0,
      blockchainTokensCount: formattedBlockchainTokens.length,
      tokenSummary: tokenSummary,
      rawDbTokens: dbTokens, // для отладки
      rawBlockchainTokens: blockchainTokensApiResult // для отладки
    });

  } catch (error) {
    console.error('Error in GET /api/tokens:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to retrieve token information', error: errorMessage }, { status: 500 });
  }
}


