import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

/**
 * 100% 자동화 동기화 스크립트
 * 사용자님이 넷리파이에서 사이트 이름을 바꾸면, 
 * 그 이름을 그대로 가져와서 보기 좋게 가공합니다.
 */
async function syncProjects() {
    const token = process.env.NETLIFY_PAT;

    if (!token) {
        console.error('❌ 에러: .env 파일에 토큰이 없습니다.');
        return;
    }

    console.log('📡 Netlify API에 접속하여 최신 사이트 목록을 조회합니다...');

    try {
        const response = await fetch('https://api.netlify.com/api/v1/sites?sort_by=updated_at', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Netlify API 응답 에러: ${response.status}`);

        const rawSites = await response.json();

        const currentSiteName = process.env.SITE_NAME; // Netlify provides this during build
        
        // 넷리파이에서 가져온 원본 데이터를 그대로 화면용 데이터로 변환
        const manifest = rawSites
            .filter(s => s.name !== currentSiteName && s.name !== 'stina-hub') // 본인(포털)은 목록에서 제외
            .map(s => {
            // 1. 넷리파이 이름을 보기 좋게 변환 (예: my-car-project -> My Car Project)
            const prettyName = s.name
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            console.log(`✨ 발견: [${s.name}] -> [${prettyName}]`);

            return {
                id: s.id,
                name: prettyName,
                slug: s.name,
                url: s.ssl_url || s.url,
                updated_at: s.updated_at,
                tag: 'LIVE SITE',
                size: 'card'
            };
        });

        const outputPath = path.join(__dirname, 'public', 'sites-manifest.json');
        fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

        console.log(`\n✅ 업데이트 완료! 총 ${manifest.length}개의 사이트 정보가 갱신되었습니다.`);
        console.log(`이제 브라우저를 확인해 보세요. 최신 이름으로 바뀌어 있을 것입니다.`);
    } catch (err) {
        console.error('❌ 실패:', err.message);
    }
}

syncProjects();
