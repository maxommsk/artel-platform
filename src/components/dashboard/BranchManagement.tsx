
'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from './Dashboard'; // Assuming useLocale is exported from Dashboard.tsx

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface Branch {
  id: number; // или string, в зависимости от вашего API
  name: string;
  address: string;
  // ... другие поля филиала ...
}

interface BranchesApiResponse {
  success: boolean; // Если API возвращает такой флаг
  branches: ApiBranch[]; // Используем ApiBranch здесь, так как buildBranchTree его ожидает
}

// Определение типа ApiBranch на основе его использования в коде
interface ApiBranch {
  BranchID: number;
  BranchName: string;
  ParentBranchID?: number | null;
  MemberCount: number;
  MaxCapacity: number;
  IsActiveForNewMembers: boolean;
  DepthLevel: number;
  children?: ApiBranch[];
  // Добавьте другие поля, если они есть в вашем API ответа для филиалов
}

// Helper function to build the tree structure from a flat list of branches
const buildBranchTree = (branches: ApiBranch[]): ApiBranch[] => {
    const branchMap: Record<number, ApiBranch> = {};
    const tree: ApiBranch[] = [];

    branches.forEach(branch => {
        branchMap[branch.BranchID] = { ...branch, children: [] };
    });

    branches.forEach(branch => {
        if (branch.ParentBranchID && branchMap[branch.ParentBranchID]) {
            // Убедимся, что children существует перед push
            if (!branchMap[branch.ParentBranchID].children) {
                branchMap[branch.ParentBranchID].children = [];
            }
            branchMap[branch.ParentBranchID].children?.push(branchMap[branch.BranchID]);
        } else {
            tree.push(branchMap[branch.BranchID]);
        }
    });
    return tree;
};

const BranchNode: React.FC<{ branch: ApiBranch; level: number }> = ({ branch, level }) => {
    const { t } = useLocale();
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first few levels

    return (
        <div style={{ marginLeft: `${level * 20}px` }} className="my-2 p-2 border-l-2 border-gray-300">
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <div onClick={() => branch.children && branch.children.length > 0 && setIsOpen(!isOpen)} className="cursor-pointer">
                    <span className="font-semibold">{branch.BranchName}</span> (ID: {branch.BranchID})
                    {branch.children && branch.children.length > 0 && (
                        <span className="ml-2 text-sm">{isOpen ? '\t▼' : '\t►'}</span>
                    )}
                </div>
                <div className="text-sm text-gray-600">
                    {t('members')}: {branch.MemberCount} / {branch.MaxCapacity} | 
                    {t('activeForNew')}: {branch.IsActiveForNewMembers ? t('yes') : t('no')} | 
                    {t('depthLevel')}: {branch.DepthLevel}
                </div>
            </div>
            {isOpen && branch.children && branch.children.length > 0 && (
                <div className="mt-1">
                    {branch.children.map(child => (
                        <BranchNode key={child.BranchID} branch={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const BranchManagement: React.FC = () => {
    const [branches, setBranches] = useState<ApiBranch[]>([]);
    const [tree, setTree] = useState<ApiBranch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLocale();

    useEffect(() => {
        const fetchBranches = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/branches');
                if (!response.ok) {
                    const errData: ApiErrorResponse = await response.json();
                    throw new Error(errData.error || errData.message || `Error ${response.status}`);
                }
                // Важно: response.json() можно вызвать только один раз.
                // Если response.ok, то парсим JSON для получения данных.
                const data: BranchesApiResponse = await response.json();
                setBranches(data.branches || []);
                setTree(buildBranchTree(data.branches || []));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBranches();
    }, []);

    if (loading) {
        return <div className="p-4">{t('loadingBranches') || 'Loading branch structure...'}</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{t('errorLoadingBranches') || 'Error loading branches:'} {error}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">{t('branchManagementTitle') || 'Branch Structure Management'}</h2>
            {tree.length === 0 && <p>{t('noBranchesFound') || 'No branches found.'}</p>}
            {tree.map(branch => (
                <BranchNode key={branch.BranchID} branch={branch} level={0} />
            ))}
        </div>
    );
};


