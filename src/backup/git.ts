// ============================================================================
// Sinkron Git — GitHub REST API (fine-grained token, Contents baca/tulis).
// Data selalu terenkripsi sebelum dikirim. Repo harus privat.
// ============================================================================

const API = 'https://api.github.com';

export interface RepoInfo {
  namaPenuh: string;
  privat: boolean;
  defaultBranch: string;
}

export interface VersiGit {
  sha: string;
  tanggal: string;
  pesan: string;
  jumlahUmat?: number;
}

export interface GitStatus {
  tersedia: boolean;
  repoPrivat: boolean | null;
  terdaftar: boolean;
  terakhirSinkron: string | null;
  antrean: number;
}

export interface KonfigurasiGit {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  pathBerkas: string;
}

function headerAuth(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'APPMI-backup',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function cekRepoPrivat(k: KonfigurasiGit): Promise<RepoInfo> {
  const res = await fetch(`${API}/repos/${encodeURIComponent(k.owner)}/${encodeURIComponent(k.repo)}`, {
    headers: headerAuth(k.token),
  });
  if (!res.ok) throw new Error(`Gagal memeriksa repo (${res.status})`);
  const data = (await res.json()) as Record<string, unknown>;
  return {
    namaPenuh: (data.full_name as string) ?? `${k.owner}/${k.repo}`,
    privat: data.private === true,
    defaultBranch: (data.default_branch as string) ?? 'main',
  };
}

export async function daftarVersi(k: KonfigurasiGit): Promise<VersiGit[]> {
  const res = await fetch(
    `${API}/repos/${encodeURIComponent(k.owner)}/${encodeURIComponent(k.repo)}/commits?path=${encodeURIComponent(k.pathBerkas)}&per_page=50`,
    { headers: headerAuth(k.token) },
  );
  if (!res.ok) throw new Error(`Gagal membaca riwayat commit (${res.status})`);
  const data = (await res.json()) as Array<Record<string, unknown>>;
  return data.map((c) => ({
    sha: (c.sha as string) ?? '',
    tanggal: ((c.commit as Record<string, unknown> | undefined)?.author as Record<string, unknown> | undefined)?.date as string ?? '',
    pesan: ((c.commit as Record<string, unknown> | undefined)?.message as string) ?? '',
  }));
}

export async function ambilBerkasCommit(
  k: KonfigurasiGit,
  ref: string,
): Promise<{ konten: string; sha: string }> {
  const res = await fetch(
    `${API}/repos/${encodeURIComponent(k.owner)}/${encodeURIComponent(k.repo)}/contents/${encodeURIComponent(k.pathBerkas)}?ref=${encodeURIComponent(ref)}`,
    { headers: headerAuth(k.token) },
  );
  if (!res.ok) throw new Error(`Gagal mengambil berkas commit (${res.status})`);
  const data = (await res.json()) as Record<string, unknown>;
  const konten = atob((data.content as string).replace(/\s/g, ''));
  return { konten, sha: (data.sha as string) ?? '' };
}

export async function simpanBerkas(
  k: KonfigurasiGit,
  kontenB64: string,
  pesanCommit: string,
  shaLama?: string,
): Promise<{ commitSha: string }> {
  const body: Record<string, unknown> = {
    message: pesanCommit,
    content: kontenB64,
    branch: k.branch,
  };
  if (shaLama) body.sha = shaLama;
  const res = await fetch(
    `${API}/repos/${encodeURIComponent(k.owner)}/${encodeURIComponent(k.repo)}/contents/${encodeURIComponent(k.pathBerkas)}`,
    {
      method: 'PUT',
      headers: headerAuth(k.token),
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const er = (await res.json()) as Record<string, unknown>;
    throw new Error((er?.message as string) ?? `Gagal menyimpan berkas (${res.status})`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  return { commitSha: (data.commit as Record<string, unknown> | undefined)?.sha as string ?? '' };
}

export function statusGit(k: KonfigurasiGit | null, antrean: number): GitStatus {
  return {
    tersedia: !!k,
    repoPrivat: k ? null : null,
    terdaftar: !!k,
    terakhirSinkron: null,
    antrean,
  };
}
