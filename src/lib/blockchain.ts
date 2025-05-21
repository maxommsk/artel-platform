// Утилиты для работы с блокчейном и токенизацией
// ВАЖНО: Этот файл содержит упрощенную реализацию для демонстрации.
// В реальной системе потребуется более надежная обработка ошибок, 
// управление ключами, загрузка ABI из файла и возможно другой подход к подключению.

import { ethers } from 'ethers';

// Интерфейс для токена
export interface TokenData {
  id: string;
  type: 'МК-Н' | 'МК-Ж' | 'МК-Р';
  amount: number;
  price: number; // Цена при выпуске
  owner: string; // Адрес владельца в блокчейне
  propertyId?: number;
  status: 'active' | 'burned';
  createdAt: number; // Timestamp создания в блокчейне
  updatedAt: number; // Timestamp последнего обновления в блокчейне
}

// Интерфейс для транзакции с токенами (событие блокчейна)
export interface TokenTransactionEvent {
  txHash: string;
  blockNumber: number;
  tokenId: string;
  type: 'mint' | 'transfer' | 'burn';
  amount: number;
  from?: string;
  to?: string;
  timestamp: number;
}

// ABI для смарт-контракта токенов (упрощенная версия)
// В реальном приложении ABI следует загружать из артефактов компиляции контракта.
const tokenABI = [
  // Функции записи (требуют подписи транзакций)
  "function mint(address to, string tokenType, uint256 amount, uint256 price, uint256 propertyId) returns (string)",
  "function transfer(string tokenId, address from, address to, uint256 amount) returns (bool)",
  "function burn(string tokenId, uint256 amount) returns (bool)",
  
  // Функции чтения (не требуют подписи)
  "function getToken(string tokenId) view returns (string, string, uint256, uint256, address, uint256, string, uint256, uint256)",
  "function balanceOf(address owner, string tokenType) view returns (uint256)",
  "function getTokensByOwner(address owner) view returns (string[])",
  
  // События
  "event TokenMinted(string indexed tokenId, string tokenType, uint256 amount, uint256 price, address indexed owner, uint256 propertyId)",
  "event TokenTransferred(string indexed tokenId, address indexed from, address indexed to, uint256 amount)",
  "event TokenBurned(string indexed tokenId, uint256 amount, address indexed burner)"
];

// Класс-обертка для ошибок блокчейна
export class BlockchainError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'BlockchainError';
  }
}

// Класс для работы с блокчейном и токенами
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet; // Кошелек администратора/сервиса для выполнения операций mint/burn
  private contractAddress: string;

  constructor() {
    // Конфигурация должна быть загружена из переменных окружения
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddr = process.env.TOKEN_CONTRACT_ADDRESS;
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

    if (!rpcUrl || !contractAddr || !adminPrivateKey) {
      console.error('BLOCKCHAIN_RPC_URL, TOKEN_CONTRACT_ADDRESS, and ADMIN_PRIVATE_KEY must be set in environment variables.');
      // В реальном приложении здесь лучше выбросить ошибку, чтобы предотвратить запуск без конфигурации
      // throw new Error('Blockchain configuration is missing in environment variables.');
      // Для демонстрации используем заглушки, но сервис будет неработоспособен
      this.provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Placeholder
      this.contractAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
      this.wallet = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000000', this.provider); // Placeholder
    } else {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.contractAddress = contractAddr;
        this.wallet = new ethers.Wallet(adminPrivateKey, this.provider);
    }
    
    this.contract = new ethers.Contract(this.contractAddress, tokenABI, this.wallet);
    console.log(`BlockchainService initialized. Connected to RPC: ${rpcUrl}, Contract: ${this.contractAddress}, Admin Wallet: ${this.wallet.address}`);
  }

  // --- Методы записи в блокчейн (требуют газа и подписи) ---

  /**
   * Выпускает новые токены на адрес пользователя.
   * Выполняется от имени кошелька администратора.
   */
  async mintTokens(
    to: string,
    tokenType: 'МК-Н' | 'МК-Ж' | 'МК-Р',
    amount: number,
    price: number,
    propertyId?: number
  ): Promise<{ txHash: string; tokenId: string }> {
    try {
      console.log(`Minting tokens: to=${to}, type=${tokenType}, amount=${amount}, price=${price}, propertyId=${propertyId}`);
      const tx = await this.contract.mint(to, tokenType, ethers.parseUnits(amount.toString(), 0), ethers.parseUnits(price.toString(), 0), propertyId || 0);
      console.log(`Mint transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Mint transaction confirmed in block: ${receipt.blockNumber}`);

      // Получение ID токена из события в логах транзакции
      const event = receipt.logs
        ?.map((log: any) => {
          try {
            // Убедимся, что лог относится к нашему контракту
            if (log.address.toLowerCase() !== this.contractAddress.toLowerCase()) return null;
            return this.contract.interface.parseLog(log as any); // ethers v6 требует явного приведения типа
          } catch (e) {
            // Игнорируем логи, которые не можем разобрать (например, от других контрактов)
            return null;
          }
        })
        .find((event: any) => event && event.name === 'TokenMinted');

      if (!event || !event.args || event.args.length === 0) {
        console.error('TokenMinted event not found or has no arguments in transaction receipt:', receipt);
        throw new BlockchainError('Не удалось получить ID токена из события TokenMinted');
      }

      const tokenId = event.args[0]; // Первый аргумент события TokenMinted - tokenId
      console.log(`Token minted successfully. Token ID: ${tokenId}, Tx Hash: ${tx.hash}`);
      return { txHash: tx.hash, tokenId };

    } catch (error: any) {
      console.error('Ошибка при выпуске токенов:', error);
      throw new BlockchainError('Ошибка при выпуске токенов', error);
    }
  }

  /**
   * Передает токены от одного пользователя другому.
   * ВАЖНО: В текущей реализации эта функция выполняется от имени админа.
   * В реальной системе пользователь должен сам подписывать транзакцию transfer.
   * Это потребует интеграции с кошельками пользователей (MetaMask и т.д.).
   */
  async transferTokens(tokenId: string, from: string, to: string, amount: number): Promise<{ txHash: string }> {
    try {
      console.log(`Transferring tokens: tokenId=${tokenId}, from=${from}, to=${to}, amount=${amount}`);
      // Здесь должна быть логика проверки, что 'from' совпадает с владельцем токена
      // и что у 'from' достаточно токенов.
      // В смарт-контракте это обычно делается через require().
      
      // ВАЖНО: Сейчас транзакция подписывается кошельком сервиса (this.wallet).
      // Это НЕПРАВИЛЬНО для перевода от имени пользователя.
      // Для демонстрации оставляем так, но это требует переделки.
      const tx = await this.contract.transfer(tokenId, from, to, ethers.parseUnits(amount.toString(), 0));
      console.log(`Transfer transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transfer transaction confirmed. Tx Hash: ${tx.hash}`);
      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('Ошибка при передаче токенов:', error);
      throw new BlockchainError('Ошибка при передаче токенов', error);
    }
  }

  /**
   * Сжигает токены пользователя.
   * Выполняется от имени кошелька администратора (или специального сжигающего контракта).
   */
  async burnTokens(tokenId: string, amount: number): Promise<{ txHash: string }> {
    try {
      console.log(`Burning tokens: tokenId=${tokenId}, amount=${amount}`);
      // Здесь может быть проверка, что сжигание инициировано правильно (например, при выкупе недвижимости)
      const tx = await this.contract.burn(tokenId, ethers.parseUnits(amount.toString(), 0));
      console.log(`Burn transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Burn transaction confirmed. Tx Hash: ${tx.hash}`);
      return { txHash: tx.hash };
    } catch (error: any) {
      console.error('Ошибка при сжигании токенов:', error);
      throw new BlockchainError('Ошибка при сжигании токенов', error);
    }
  }

  // --- Методы чтения из блокчейна (не требуют газа) ---

  /**
   * Получает информацию о конкретном токене по его ID.
   */
  async getToken(tokenId: string): Promise<TokenData | null> {
    try {
      const result = await this.contract.getToken(tokenId);
      // Проверяем, вернул ли контракт данные (может вернуть пустые значения, если токен не найден)
      if (!result || !result[0]) { // result[0] это id
          return null; 
      }
      const [id, type, amount, price, owner, propertyId, status, createdAt, updatedAt] = result;
      
      return {
        id,
        type: type as 'МК-Н' | 'МК-Ж' | 'МК-Р',
        amount: Number(ethers.formatUnits(amount, 0)),
        price: Number(ethers.formatUnits(price, 0)),
        owner,
        propertyId: Number(ethers.formatUnits(propertyId, 0)) > 0 ? Number(ethers.formatUnits(propertyId, 0)) : undefined,
        status: status as 'active' | 'burned',
        createdAt: Number(ethers.formatUnits(createdAt, 0)),
        updatedAt: Number(ethers.formatUnits(updatedAt, 0))
      };
    } catch (error: any) {
      // Если контракт выдает ошибку (например, токен не найден), возвращаем null
      if (error.code === 'CALL_EXCEPTION') { 
          console.warn(`Токен с ID ${tokenId} не найден в контракте.`);
          return null;
      }
      console.error(`Ошибка при получении информации о токене ${tokenId}:`, error);
      throw new BlockchainError(`Ошибка при получении информации о токене ${tokenId}`, error);
    }
  }

  /**
   * Получает общий баланс токенов определенного типа для пользователя.
   */
  async getBalance(owner: string, tokenType: 'МК-Н' | 'МК-Ж' | 'МК-Р'): Promise<number> {
    try {
      const balance = await this.contract.balanceOf(owner, tokenType);
      return Number(ethers.formatUnits(balance, 0));
    } catch (error: any) {
      console.error(`Ошибка при получении баланса токенов типа ${tokenType} для ${owner}:`, error);
      throw new BlockchainError(`Ошибка при получении баланса токенов типа ${tokenType} для ${owner}`, error);
    }
  }

  /**
   * Получает список всех ID токенов, принадлежащих пользователю.
   */
  async getTokenIdsByOwner(owner: string): Promise<string[]> {
      try {
          const tokenIds: string[] = await this.contract.getTokensByOwner(owner);
          return tokenIds;
      } catch (error: any) {
          console.error(`Ошибка при получении ID токенов для ${owner}:`, error);
          throw new BlockchainError(`Ошибка при получении ID токенов для ${owner}`, error);
      }
  }

  /**
   * Получает детальную информацию обо всех токенах пользователя.
   */
  async getTokensByOwner(owner: string): Promise<TokenData[]> {
    try {
      const tokenIds = await this.getTokenIdsByOwner(owner);
      const tokenPromises = tokenIds.map(id => this.getToken(id));
      const tokens = (await Promise.all(tokenPromises)).filter(token => token !== null) as TokenData[];
      return tokens;
    } catch (error: any) {
      // Ошибка уже обработана в getTokenIdsByOwner или getToken
      throw new BlockchainError(`Ошибка при получении детальной информации о токенах для ${owner}`, error);
    }
  }

  // --- Вспомогательные методы ---

  /**
   * Генерирует новый случайный адрес Ethereum.
   * ВАЖНО: Этот метод НЕ СОХРАНЯЕТ приватный ключ.
   * Он полезен только для генерации адреса, который будет контролироваться внешним кошельком
   * или если приватный ключ управляется отдельно и безопасно.
   * Для платформы, управляющей кошельками пользователей, требуется более сложная система.
   */
  generateWalletAddress(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    console.warn('Generated new wallet. Private key MUST be stored securely and separately.');
    return { address: wallet.address, privateKey: wallet.privateKey };
  }

  /**
   * Проверяет, является ли строка валидным адресом Ethereum.
   */
  isValidAddress(address: string): boolean {
      return ethers.isAddress(address);
  }
}

// Создание единственного экземпляра сервиса (Singleton pattern)
// Это может быть не лучшим решением для serverless окружений, где требуется управление соединениями.
export const blockchainService = new BlockchainService();

