import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/auth';
export async function loginWithLineCode(code: string) {
    console.log('loginWithLineCode code:', code);
    console.log('API:', `${API_BASE}/line/callback`);
    // 1. 取得 access_token
    const res = await axios.post(
        `${API_BASE}/line/callback`,
        { code }
    );
    return res;
}
