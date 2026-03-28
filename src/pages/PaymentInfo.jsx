export default function PaymentInfo() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] pt-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Payment Information
        </h1>

        <div className="space-y-6 text-textSub leading-7">
          <p>
            At DenPartner, we ensure secure and transparent payout processing
            for all valid earnings.
          </p>

          <div>
            <h3 className="font-semibold text-black">
              How You Earn
            </h3>
            <p className="text-sm">
              You earn commission whenever a valid conversion happens through
              your shared campaign link.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Wallet System
            </h3>
            <p className="text-sm">
              Once verified, earnings are credited to your DenPartner wallet.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Withdrawals
            </h3>
            <p className="text-sm">
              You can request withdrawal anytime after reaching minimum balance.
              Processing usually takes 24–72 hours.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Minimum Withdrawal
            </h3>
            <p className="text-sm">
              Minimum withdrawal amount is ₹10.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Daily Limit
            </h3>
            <p className="text-sm">
              Maximum 3 withdrawal requests are allowed per day.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Payment Methods
            </h3>
            <p className="text-sm">
              Payments are processed directly to your verified bank account.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-black">
              Important Note
            </h3>
            <p className="text-sm">
              Payments are released only for approved and valid commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}