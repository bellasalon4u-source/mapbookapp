import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-[32px] border border-[#efe4d7] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#edf7ee] text-4xl text-[#1fc16b]">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#1d1712]">
            Booking request sent
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6f655b]">
            Your secure booking fee has been placed on hold. The master will
            review your request and confirm the appointment.
          </p>

          <div className="mt-6 rounded-3xl bg-[#f8f2e8] p-4 text-left">
            <p className="text-sm font-semibold text-[#4e463d]">
              What happens next?
            </p>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#6b6157]">
              <li>• The master reviews your booking request</li>
              <li>• After confirmation, your booking becomes active</li>
              <li>• You will unlock address, contact details and navigation</li>
              <li>• The £5 booking fee becomes platform revenue only after confirmation</li>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl border border-[#efe4d7] bg-[#fffdf9] p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7a7065]">Booking fee</span>
              <span className="text-sm font-bold text-[#1d1712]">£5</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[#7a7065]">Status</span>
              <span className="rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-red-600">
                Waiting for confirmation
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/messages"
              className="block rounded-2xl bg-[#2f241c] px-5 py-4 text-sm font-bold text-white"
            >
              Open messages
            </Link>

            <Link
              href="/"
              className="block rounded-2xl border border-[#e7dac8] bg-white px-5 py-4 text-sm font-bold text-[#2f241c]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
