'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tools = [
  { name: '광고 성과 계산', path: '/tools/ad-performance' },
  { name: '전환율 최적화', path: '/tools/conversion-optimization' },
  { name: '목표 CPA', path: '/tools/target-cpa' },
  { name: 'LTV 계산기', path: '/tools/ltv-calculator' },
  { name: 'LTV:CAC 비율', path: '/tools/ltv-cac-ratio' },
  { name: '손익분기점', path: '/tools/break-even' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-indigo-600">마케팅 도구 모음</h1>
          </Link>
          <nav className="flex space-x-1">
            {tools.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === tool.path
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tool.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

