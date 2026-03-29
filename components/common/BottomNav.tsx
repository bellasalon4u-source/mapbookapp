import Link from 'next/link';

type BottomNavProps = {
  active?: 'home' | 'messages' | 'profile';
};

export default function BottomNav({ active }: BottomNavProps) {
  const activeClass = 'text-[#1d1712] font-bold';
  const inactiveClass = 'text-[#7a7065]';

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-[#efe5d8] bg-[#fffdf9]">
      <div className="mx-auto grid max-w-md grid-cols-3 px-4 py-3 text-center text-sm">
        <Link
          href="/"
          className={active === 'home' ? activeClass : inactiveClass}
        >
          Home
        </Link>

        <Link
          href="/messages"
          className={active === 'messages' ? activeClass : inactiveClass}
        >
          Messages
        </Link>

        <Link
          href="/profile"
          className={active === 'profile' ? activeClass : inactiveClass}
        >
          Profile
        </Link>
      </div>
    </div>
  );
}
