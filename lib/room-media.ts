// Photos and videos per Electronic City room and occasion (client + server safe, static files in /public).
// BTM rooms are not listed here: they keep the photos set for them in Admin → Theatres.

export interface RoomVideo { src: string; poster: string; label: string }
export interface RoomMedia { images: string[]; videos: RoomVideo[] }
export type RoomKey = 'couple' | 'celebration' | 'family';
export type OccasionKey = 'birthday' | 'anniversary' | 'bride' | 'groom' | 'mom' | 'proposal' | 'date' | 'naming';

const shots = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `/images/ecity/${prefix}-${i + 1}.webp`);
const video = (file: string, label: string): RoomVideo => ({ src: `/videos/celebrations/${file}.mp4`, poster: `/images/ecity/posters/${file}.webp`, label });

const V = {
  coupleAnniversary: video('couple-anniversary', 'Couple room · Anniversary'),
  coupleBirthday: video('couple-birthday', 'Couple room · Birthday'),
  marryMe: video('couple-marry-me', 'Couple room · Marry me'),
  iLoveYou: video('couple-i-love-you', 'Couple room · I love you'),
  celebrationAnniversary: video('celebration-anniversary', 'Celebration room · Anniversary'),
  celebrationBirthday: video('celebration-birthday', 'Celebration room · Birthday'),
  celebrationBride: video('celebration-bride-to-be', 'Celebration room · Bride to be'),
  celebrationGroom: video('celebration-groom-to-be', 'Celebration room · Groom to be'),
  familyBirthday: video('family-birthday', 'Family room · Birthday'),
  firstBirthday: video('kids-first-birthday', '1st birthday setup'),
};

const ROOM_MEDIA: Record<RoomKey, Partial<Record<OccasionKey, RoomMedia>>> = {
  // Red heart room. (The Drive folders for the two couple occasions were named the other way round: these follow what the photos show.)
  couple: {
    anniversary: { images: shots('couple-anniversary', 3), videos: [V.coupleAnniversary] },
    birthday: { images: shots('couple-birthday', 2), videos: [V.coupleBirthday] },
    proposal: { images: [...shots('couple-anniversary', 3)], videos: [V.marryMe, V.iLoveYou] },
    date: { images: [...shots('couple-anniversary', 3).reverse()], videos: [V.iLoveYou] },
  },
  // Gold balloon room.
  celebration: {
    anniversary: { images: shots('celebration-anniversary', 5), videos: [V.celebrationAnniversary] },
    birthday: { images: [...shots('kids-celebration', 2), ...shots('celebration-birthday', 6)], videos: [V.celebrationBirthday, V.firstBirthday] },
    bride: { images: shots('celebration-bride', 3), videos: [V.celebrationBride] },
    groom: { images: shots('celebration-groom', 3), videos: [V.celebrationGroom] },
    mom: { images: shots('celebration-mom', 2), videos: [] },
    naming: { images: shots('naming', 2), videos: [] },
  },
  // Purple balloon room.
  family: {
    anniversary: { images: shots('family-anniversary', 4), videos: [] },
    birthday: { images: [...shots('kids-family', 8), ...shots('family-birthday', 4)], videos: [V.familyBirthday, V.firstBirthday] },
    bride: { images: shots('family-bride', 2), videos: [] },
    groom: { images: shots('family-groom', 2), videos: [] },
    mom: { images: shots('family-mom', 3), videos: [] },
    naming: { images: shots('naming', 2), videos: [] },
  },
};

export function roomKey(theatreName: string): RoomKey | null {
  const n = (theatreName || '').toLowerCase();
  if (n.includes('couple')) return 'couple';
  if (n.includes('celebration')) return 'celebration';
  if (n.includes('family')) return 'family';
  return null;
}

export function occasionKey(occasion: string): OccasionKey | null {
  const o = (occasion || '').toLowerCase();
  if (!o) return null;
  if (o.includes('birthday')) return 'birthday';
  if (o.includes('anniversary')) return 'anniversary';
  if (o.includes('bride')) return 'bride';
  if (o.includes('groom')) return 'groom';
  if (o.includes('mom') || o.includes('baby shower')) return 'mom';
  if (o.includes('proposal') || o.includes('marry')) return 'proposal';
  if (o.includes('date')) return 'date';
  if (o.includes('naming')) return 'naming';
  return null;
}

/** Photos and videos of this room set up for this occasion; null when there are none (e.g. BTM rooms, "Other"). */
export function roomMedia(theatreName: string, occasion: string): RoomMedia | null {
  const room = roomKey(theatreName);
  const occ = occasionKey(occasion);
  if (!room || !occ) return null;
  const m = ROOM_MEDIA[room][occ];
  return m && (m.images.length || m.videos.length) ? m : null;
}

/** A video in the home page "Our celebrations, in motion" strip (Admin → Website → Videos). */
export interface ShowcaseVideo { id: number; title: string; room: string; video_url: string; poster_url: string }
