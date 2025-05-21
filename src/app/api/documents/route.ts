// API для управления документами
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { withRoleCheck, AccessRequirements } from '@/lib/rbac';
import { Document, DocumentCreateInput } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// Получение документов пользователя
export async function GET(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.MEMBER_OWN_DATA)(request, async () => {
    try {
            const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Требуется аутентификация' },
          { status: 401 }
        );
      }
      
      // Получение ID пайщика для текущего пользователя
      const { results: members } = await db.prepare(
  'SELECT id FROM members WHERE user_id = ?'
).bind(user.id as number).all<{ id: number }>();

      
      if (members.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Пользователь не является пайщиком' },
          { status: 403 }
        );
      }
      
      const memberId = members[0].id;
      
      // Получение документов пайщика
      const { results: documents } = await db.prepare(
  'SELECT * FROM documents WHERE member_id = ? ORDER BY created_at DESC'
).bind(memberId as number).all<any[]>();

      
      return NextResponse.json({
        success: true,
        documents
      });
      
    } catch (error) {
      console.error('Ошибка при получении документов:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}

// Создание нового документа
export async function POST(request: NextRequest) {
  // Проверка прав доступа
  const accessCheck = await withRoleCheck(AccessRequirements.ADMIN_AND_MANAGER)(request, async () => {
    try {
      const data: DocumentCreateInput = await request.json();
      
      // Проверка наличия обязательных полей
      if (!data.member_id || !data.document_type || !data.title || !data.status) {
        return NextResponse.json(
          { success: false, message: 'Не указаны обязательные поля' },
          { status: 400 }
        );
      }
      
      // Проверка существования пайщика
          const { results: members } = await db.prepare(
      'SELECT id FROM members WHERE id = ?'
    ).bind(data.member_id as number).all<{ id: number }>();

      
      if (members.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Указанный пайщик не существует' },
          { status: 404 }
        );
      }
      
      // Создание документа
            // Создание документа
      const filePath: string = "uploads/temp_document.pdf";

const result = await db.prepare(
  `INSERT INTO documents (member_id, document_type, title, description, file_path, ipfs_hash, blockchain_hash, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
).bind(
  data.member_id as number,
  data.document_type as string,
  data.title as string,
  data.description as string,
  filePath,
  data.ipfs_hash || null,
  data.blockchain_hash || null,
  'ожидает подтверждения'
).run();

const documentId = result.meta.last_row_id;

const { results: newDocumentResults } = await db.prepare(
  'SELECT * FROM documents WHERE id = ?'
).bind(documentId).all<any[]>();

const newDocument = newDocumentResults && newDocumentResults.length > 0 ? newDocumentResults[0] : null;

      
      // Получение созданного документа
      
      if (!newDocument) { 
        return NextResponse.json(
          { success: false, message: 'Ошибка при создании документа' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Документ успешно создан',
        document: newDocument[0]
      });
      
    } catch (error) {
      console.error('Ошибка при создании документа:', error);
      return NextResponse.json(
        { success: false, message: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
  
  return accessCheck;
}
