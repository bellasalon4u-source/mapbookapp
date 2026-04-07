export type ReferralFriendStatus =
  | 'registered'
  | 'paid'
  | 'reward_earned'
  | 'pending_payment';

export type ReferralFriend = {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  status: ReferralFriendStatus;
  paidUnlock: boolean;
  rewardGranted: boolean;
};

export type ReferralState = {
  referralCode: string;
  referralLink: string;
  invitedCount: number;
  paidCount: number;
  freeBookingsAvailable: number;
  friends: ReferralFriend[];
};

const STORAGE_KEY = 'mapbook_referral_state';

const defaultReferralState: ReferralState = {
  referralCode: 'ALEXCARTER',
  referralLink: 'https://mapbook.vercel.app/invite/ALEXCARTER',
  invitedCount: 5,
  paidCount: 3,
  freeBookingsAvailable: 3,
  friends: [
    {
      id: 'ref_1',
      name: 'Anna Smith',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      joinedAt: '2026-04-10T10:00:00.000Z',
      status: 'paid',
      paidUnlock: true,
      rewardGranted: true,
    },
    {
      id: 'ref_2',
      name: 'James Brown',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      joinedAt: '2026-04-08T10:00:00.000Z',
      status: 'reward_earned',
      paidUnlock: true,
      rewardGranted: true,
    },
    {
      id: 'ref_3',
      name: 'Olivia Lee',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
      joinedAt: '2026-04-05T10:00:00.000Z',
      status: 'pending_payment',
      paidUnlock: false,
      rewardGranted: false,
    },
    {
      id: 'ref_4',
      name: 'Daniel Wilson',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      joinedAt: '2026-04-02T10:00:00.000Z',
      status: 'pending_payment',
      paidUnlock: false,
      rewardGranted: false,
    },
    {
      id: 'ref_5',
      name: 'Sophia Davis',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      joinedAt: '2026-03-28T10:00:00.000Z',
      status: 'paid',
      paidUnlock: true,
      rewardGranted: true,
    },
  ],
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadReferralState(): ReferralState {
  if (!isBrowser()) return defaultReferralState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultReferralState;

    const parsed = JSON.parse(raw) as ReferralState;

    return {
      referralCode:
        typeof parsed.referralCode === 'string'
          ? parsed.referralCode
          : defaultReferralState.referralCode,
      referralLink:
        typeof parsed.referralLink === 'string'
          ? parsed.referralLink
          : defaultReferralState.referralLink,
      invitedCount:
        typeof parsed.invitedCount === 'number'
          ? parsed.invitedCount
          : defaultReferralState.invitedCount,
      paidCount:
        typeof parsed.paidCount === 'number'
          ? parsed.paidCount
          : defaultReferralState.paidCount,
      freeBookingsAvailable:
        typeof parsed.freeBookingsAvailable === 'number'
          ? parsed.freeBookingsAvailable
          : defaultReferralState.freeBookingsAvailable,
      friends: Array.isArray(parsed.friends)
        ? parsed.friends
        : defaultReferralState.friends,
    };
  } catch {
    return defaultReferralState;
  }
}

let referralState: ReferralState = defaultReferralState;

if (isBrowser()) {
  referralState = loadReferralState();
}

function saveReferralState() {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(referralState));
}

function emitChange() {
  saveReferralState();
  listeners.forEach((listener) => listener());
}

export function getReferralState(): ReferralState {
  return referralState;
}

export function subscribeToReferralStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setReferralState(nextState: ReferralState) {
  referralState = nextState;
  emitChange();
}

export function resetReferralState() {
  referralState = defaultReferralState;
  emitChange();
}

export function addInvitedFriend(friend: ReferralFriend) {
  referralState = {
    ...referralState,
    invitedCount: referralState.invitedCount + 1,
    friends: [friend, ...referralState.friends],
  };
  emitChange();
}

export function markReferralFriendPaid(friendId: string) {
  const updatedFriends = referralState.friends.map((friend) => {
    if (friend.id !== friendId) return friend;

    return {
      ...friend,
      paidUnlock: true,
      rewardGranted: true,
      status: 'reward_earned' as ReferralFriendStatus,
    };
  });

  referralState = {
    ...referralState,
    paidCount: referralState.paidCount + 1,
    freeBookingsAvailable: referralState.freeBookingsAvailable + 1,
    friends: updatedFriends,
  };

  emitChange();
}

export function useReferralFreeBooking() {
  if (referralState.freeBookingsAvailable < 1) return false;

  referralState = {
    ...referralState,
    freeBookingsAvailable: referralState.freeBookingsAvailable - 1,
  };

  emitChange();
  return true;
}
